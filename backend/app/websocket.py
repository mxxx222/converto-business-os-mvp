from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")
        
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")
        
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))
        
    async def broadcast(self, message: dict):
        """Send message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_document_event(self, event_type: str, document: dict):
        """Broadcast document-related events"""
        message = {
            "type": event_type,
            "data": document,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_customer_event(self, event_type: str, customer: dict):
        """Broadcast customer-related events"""
        message = {
            "type": event_type,
            "data": customer,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message)


manager = ConnectionManager()


# Helper functions to emit events from other parts of the app
async def emit_document_created(document: dict):
    await manager.broadcast_document_event("document.created", document)


async def emit_document_processing(document: dict):
    await manager.broadcast_document_event("document.processing", document)


async def emit_document_completed(document: dict):
    await manager.broadcast_document_event("document.completed", document)


async def emit_document_failed(document: dict):
    await manager.broadcast_document_event("document.failed", document)


async def emit_customer_created(customer: dict):
    await manager.broadcast_customer_event("customer.created", customer)


async def emit_customer_subscription_changed(customer: dict):
    await manager.broadcast_customer_event("customer.subscription_changed", customer)

