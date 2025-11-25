"""WebSocket backpressure management and reconnection logic for DocFlow."""

from __future__ import annotations

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Set
from collections import deque

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel

# Prometheus metrics integration
try:
    from prometheus_client import Histogram, Gauge, Counter
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    # Dummy classes for when prometheus_client is not available
    class Histogram:
        def __init__(self, *args, **kwargs):
            pass
        def labels(self, **kwargs):
            return self
        def observe(self, value):
            pass
    class Gauge:
        def __init__(self, *args, **kwargs):
            pass
        def labels(self, **kwargs):
            return self
        def set(self, value):
            pass
    class Counter:
        def __init__(self, *args, **kwargs):
            pass
        def labels(self, **kwargs):
            return self
        def inc(self, value=1):
            pass

logger = logging.getLogger(__name__)

# Prometheus metrics for WebSocket operations
if PROMETHEUS_AVAILABLE:
    WS_PUBLISH_LATENCY = Histogram(
        'ws_publish_latency_seconds',
        'WebSocket message publish latency in seconds',
        ['client_id', 'priority'],
        buckets=[0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5]
    )
    
    WS_BACKPRESSURE_QUEUE_SIZE = Gauge(
        'ws_backpressure_queue_size',
        'Current WebSocket backpressure queue size',
        ['client_id']
    )
    
    WS_MESSAGES_SENT = Counter(
        'ws_messages_sent_total',
        'Total WebSocket messages sent',
        ['client_id', 'priority']
    )
    
    WS_MESSAGES_DROPPED = Counter(
        'ws_messages_dropped_total',
        'Total WebSocket messages dropped due to backpressure',
        ['client_id', 'priority']
    )
    
    WS_CONNECTIONS_ACTIVE = Gauge(
        'ws_connections_active',
        'Number of active WebSocket connections'
    )
else:
    # Dummy metrics when Prometheus is not available
    WS_PUBLISH_LATENCY = Histogram()
    WS_BACKPRESSURE_QUEUE_SIZE = Gauge()
    WS_MESSAGES_SENT = Counter()
    WS_MESSAGES_DROPPED = Counter()
    WS_CONNECTIONS_ACTIVE = Gauge()


class ConnectionState(str, Enum):
    """WebSocket connection states."""
    CONNECTING = "connecting"
    CONNECTED = "connected"
    BACKPRESSURE = "backpressure"
    RECONNECTING = "reconnecting"
    DISCONNECTED = "disconnected"
    FAILED = "failed"


class MessagePriority(str, Enum):
    """Message priority levels."""
    CRITICAL = "critical"    # System alerts, errors
    HIGH = "high"           # User actions, real-time updates
    NORMAL = "normal"       # Regular notifications
    LOW = "low"            # Background updates, stats


@dataclass
class QueuedMessage:
    """Queued WebSocket message."""
    data: Dict[str, Any]
    priority: MessagePriority
    timestamp: float
    retry_count: int = 0
    max_retries: int = 3


@dataclass
class ConnectionMetrics:
    """Connection performance metrics."""
    messages_sent: int = 0
    messages_queued: int = 0
    messages_dropped: int = 0
    bytes_sent: int = 0
    last_activity: float = field(default_factory=time.time)
    avg_latency: float = 0.0
    backpressure_events: int = 0


class BackpressureConfig(BaseModel):
    """Backpressure configuration."""
    max_queue_size: int = 1000
    max_message_size: int = 64 * 1024  # 64KB
    high_water_mark: int = 800         # Start dropping low priority messages
    critical_water_mark: int = 950     # Only allow critical messages
    flush_interval: float = 0.1        # Flush queue every 100ms
    reconnect_delay: float = 1.0       # Initial reconnect delay
    max_reconnect_delay: float = 30.0  # Maximum reconnect delay
    reconnect_attempts: int = 10       # Max reconnection attempts


class WebSocketManager:
    """WebSocket connection manager with backpressure control."""
    
    def __init__(self, config: Optional[BackpressureConfig] = None):
        self.config = config or BackpressureConfig()
        self.connections: Dict[str, WebSocket] = {}
        self.connection_states: Dict[str, ConnectionState] = {}
        self.message_queues: Dict[str, deque[QueuedMessage]] = {}
        self.metrics: Dict[str, ConnectionMetrics] = {}
        self.flush_tasks: Dict[str, asyncio.Task] = {}
        
        # Global settings
        self.active_connections: Set[str] = set()
        self.logger = logging.getLogger(__name__)
    
    async def connect(self, websocket: WebSocket, client_id: str) -> bool:
        """Accept WebSocket connection with backpressure setup."""
        try:
            await websocket.accept()
            
            # Initialize connection state
            self.connections[client_id] = websocket
            self.connection_states[client_id] = ConnectionState.CONNECTED
            self.message_queues[client_id] = deque()
            self.metrics[client_id] = ConnectionMetrics()
            self.active_connections.add(client_id)
            
            # Update Prometheus metrics
            if PROMETHEUS_AVAILABLE:
                WS_CONNECTIONS_ACTIVE.set(len(self.active_connections))
            
            # Start message flush task
            self.flush_tasks[client_id] = asyncio.create_task(
                self._flush_queue_task(client_id)
            )
            
            self.logger.info(f"WebSocket connected: {client_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to connect WebSocket {client_id}: {e}")
            return False
    
    async def disconnect(self, client_id: str, code: int = 1000, reason: str = ""):
        """Disconnect WebSocket with cleanup."""
        if client_id not in self.connections:
            return
        
        try:
            # Cancel flush task
            if client_id in self.flush_tasks:
                self.flush_tasks[client_id].cancel()
                del self.flush_tasks[client_id]
            
            # Close connection
            websocket = self.connections[client_id]
            await websocket.close(code=code, reason=reason)
            
        except Exception as e:
            self.logger.error(f"Error closing WebSocket {client_id}: {e}")
        
        finally:
            # Clean up state
            self._cleanup_connection(client_id)
            
            # Update Prometheus metrics
            if PROMETHEUS_AVAILABLE:
                WS_CONNECTIONS_ACTIVE.set(len(self.active_connections))
            
            self.logger.info(f"WebSocket disconnected: {client_id}")
    
    def _cleanup_connection(self, client_id: str):
        """Clean up connection state."""
        self.connections.pop(client_id, None)
        self.connection_states.pop(client_id, None)
        self.message_queues.pop(client_id, None)
        self.metrics.pop(client_id, None)
        self.active_connections.discard(client_id)
    
    async def send_message(
        self,
        client_id: str,
        data: Dict[str, Any],
        priority: MessagePriority = MessagePriority.NORMAL
    ) -> bool:
        """Send message with backpressure control."""
        if client_id not in self.connections:
            self.logger.warning(f"Attempted to send to disconnected client: {client_id}")
            return False
        
        # Check message size
        message_size = len(json.dumps(data).encode())
        if message_size > self.config.max_message_size:
            self.logger.warning(
                f"Message too large ({message_size} bytes) for client {client_id}"
            )
            return False
        
        # Create queued message
        message = QueuedMessage(
            data=data,
            priority=priority,
            timestamp=time.time()
        )
        
        # Apply backpressure logic
        queue = self.message_queues[client_id]
        queue_size = len(queue)
        
        if queue_size >= self.config.max_queue_size:
            # Queue full - drop message
            self.metrics[client_id].messages_dropped += 1
            if PROMETHEUS_AVAILABLE:
                WS_MESSAGES_DROPPED.labels(client_id=client_id, priority=priority.value).inc()
            self.logger.warning(f"Queue full for client {client_id}, dropping message")
            return False
        
        elif queue_size >= self.config.critical_water_mark:
            # Critical backpressure - only allow critical messages
            if priority != MessagePriority.CRITICAL:
                self.metrics[client_id].messages_dropped += 1
                if PROMETHEUS_AVAILABLE:
                    WS_MESSAGES_DROPPED.labels(client_id=client_id, priority=priority.value).inc()
                return False
            
            # Drop oldest non-critical message to make room
            self._drop_low_priority_messages(client_id, 1)
        
        elif queue_size >= self.config.high_water_mark:
            # High backpressure - drop low priority messages
            if priority == MessagePriority.LOW:
                self.metrics[client_id].messages_dropped += 1
                if PROMETHEUS_AVAILABLE:
                    WS_MESSAGES_DROPPED.labels(client_id=client_id, priority=priority.value).inc()
                return False
            
            # Drop some low priority messages
            self._drop_low_priority_messages(client_id, 5)
        
        # Add message to queue
        queue.append(message)
        self.metrics[client_id].messages_queued += 1
        
        # Update Prometheus metrics
        if PROMETHEUS_AVAILABLE:
            WS_BACKPRESSURE_QUEUE_SIZE.labels(client_id=client_id).set(len(queue))
        
        # Update connection state
        if queue_size >= self.config.high_water_mark:
            self.connection_states[client_id] = ConnectionState.BACKPRESSURE
            self.metrics[client_id].backpressure_events += 1
        
        return True
    
    def _drop_low_priority_messages(self, client_id: str, count: int):
        """Drop low priority messages from queue."""
        queue = self.message_queues[client_id]
        dropped = 0
        
        # Remove low priority messages from the end (oldest first)
        for _ in range(min(count, len(queue))):
            for i in range(len(queue) - 1, -1, -1):
                if queue[i].priority == MessagePriority.LOW:
                    del queue[i]
                    dropped += 1
                    break
            if dropped >= count:
                break
        
        if dropped > 0:
            self.metrics[client_id].messages_dropped += dropped
            self.logger.debug(f"Dropped {dropped} low priority messages for {client_id}")
    
    async def _flush_queue_task(self, client_id: str):
        """Background task to flush message queue."""
        while client_id in self.active_connections:
            try:
                await asyncio.sleep(self.config.flush_interval)
                await self._flush_queue(client_id)
            except asyncio.CancelledError:
                break
            except Exception as e:
                self.logger.error(f"Error in flush task for {client_id}: {e}")
    
    async def _flush_queue(self, client_id: str):
        """Flush pending messages for a client."""
        if client_id not in self.connections:
            return
        
        websocket = self.connections[client_id]
        queue = self.message_queues[client_id]
        
        if not queue:
            return
        
        # Sort messages by priority
        messages_to_send = []
        while queue and len(messages_to_send) < 10:  # Batch size limit
            message = queue.popleft()
            messages_to_send.append(message)
        
        # Sort by priority (critical first)
        priority_order = {
            MessagePriority.CRITICAL: 0,
            MessagePriority.HIGH: 1,
            MessagePriority.NORMAL: 2,
            MessagePriority.LOW: 3
        }
        messages_to_send.sort(key=lambda m: priority_order[m.priority])
        
        # Send messages
        for message in messages_to_send:
            try:
                start_time = time.time()
                await websocket.send_json(message.data)
                
                # Calculate latency
                latency = time.time() - start_time
                
                # Update internal metrics
                metrics = self.metrics[client_id]
                metrics.messages_sent += 1
                metrics.bytes_sent += len(json.dumps(message.data).encode())
                metrics.last_activity = time.time()
                metrics.avg_latency = (metrics.avg_latency * 0.9) + (latency * 0.1)
                
                # Update Prometheus metrics
                if PROMETHEUS_AVAILABLE:
                    WS_PUBLISH_LATENCY.labels(
                        client_id=client_id,
                        priority=message.priority.value
                    ).observe(latency)
                    WS_MESSAGES_SENT.labels(
                        client_id=client_id,
                        priority=message.priority.value
                    ).inc()
                
            except WebSocketDisconnect:
                self.logger.info(f"Client {client_id} disconnected during flush")
                await self._handle_disconnect(client_id)
                break
            except Exception as e:
                self.logger.error(f"Error sending message to {client_id}: {e}")
                message.retry_count += 1
                
                if message.retry_count <= message.max_retries:
                    # Re-queue message for retry
                    queue.appendleft(message)
                else:
                    self.metrics[client_id].messages_dropped += 1
        
        # Update connection state
        if len(queue) < self.config.high_water_mark:
            self.connection_states[client_id] = ConnectionState.CONNECTED
    
    async def _handle_disconnect(self, client_id: str):
        """Handle unexpected disconnection."""
        self.connection_states[client_id] = ConnectionState.DISCONNECTED
        self._cleanup_connection(client_id)
    
    async def broadcast(
        self,
        data: Dict[str, Any],
        priority: MessagePriority = MessagePriority.NORMAL,
        exclude: Optional[Set[str]] = None
    ):
        """Broadcast message to all connected clients."""
        exclude = exclude or set()
        
        tasks = []
        for client_id in list(self.active_connections):
            if client_id not in exclude:
                tasks.append(self.send_message(client_id, data, priority))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    def get_connection_info(self, client_id: str) -> Optional[Dict[str, Any]]:
        """Get connection information and metrics."""
        if client_id not in self.connections:
            return None
        
        metrics = self.metrics[client_id]
        queue = self.message_queues[client_id]
        
        return {
            "client_id": client_id,
            "state": self.connection_states[client_id],
            "queue_size": len(queue),
            "metrics": {
                "messages_sent": metrics.messages_sent,
                "messages_queued": metrics.messages_queued,
                "messages_dropped": metrics.messages_dropped,
                "bytes_sent": metrics.bytes_sent,
                "avg_latency": metrics.avg_latency,
                "backpressure_events": metrics.backpressure_events,
                "last_activity": metrics.last_activity,
            }
        }
    
    def get_all_connections(self) -> List[Dict[str, Any]]:
        """Get information for all connections."""
        return [
            self.get_connection_info(client_id)
            for client_id in self.active_connections
        ]


# Client-side reconnection logic (JavaScript)
WEBSOCKET_CLIENT_JS = """
class DocFlowWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            reconnectDelay: 1000,
            maxReconnectDelay: 30000,
            reconnectAttempts: 10,
            heartbeatInterval: 30000,
            ...options
        };
        
        this.ws = null;
        this.reconnectCount = 0;
        this.isReconnecting = false;
        this.heartbeatTimer = null;
        this.messageQueue = [];
        
        this.connect();
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.scheduleReconnect();
        }
    }
    
    setupEventHandlers() {
        this.ws.onopen = (event) => {
            console.log('WebSocket connected');
            this.reconnectCount = 0;
            this.isReconnecting = false;
            this.startHeartbeat();
            this.flushMessageQueue();
            this.onOpen?.(event);
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.onMessage?.(data);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            this.stopHeartbeat();
            this.onClose?.(event);
            
            if (!event.wasClean && this.reconnectCount < this.options.reconnectAttempts) {
                this.scheduleReconnect();
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.onError?.(error);
        };
    }
    
    scheduleReconnect() {
        if (this.isReconnecting) return;
        
        this.isReconnecting = true;
        const delay = Math.min(
            this.options.reconnectDelay * Math.pow(2, this.reconnectCount),
            this.options.maxReconnectDelay
        );
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectCount + 1})`);
        
        setTimeout(() => {
            this.reconnectCount++;
            this.connect();
        }, delay);
    }
    
    send(data) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            // Queue message for when connection is restored
            this.messageQueue.push(data);
            if (this.messageQueue.length > 100) {
                this.messageQueue.shift(); // Remove oldest message
            }
        }
    }
    
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }
    
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.send({ type: 'ping', timestamp: Date.now() });
            }
        }, this.options.heartbeatInterval);
    }
    
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    
    close() {
        this.stopHeartbeat();
        this.reconnectCount = this.options.reconnectAttempts; // Prevent reconnection
        if (this.ws) {
            this.ws.close(1000, 'Client closing');
        }
    }
}
"""


# Global WebSocket manager instance
websocket_manager = WebSocketManager()

