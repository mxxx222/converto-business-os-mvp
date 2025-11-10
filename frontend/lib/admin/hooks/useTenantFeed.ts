/** @fileoverview Real-time WebSocket hook for admin modules with tenant isolation */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketEvent {
  id: string;
  type: string;
  tenant_id: string;
  ts: string;
  details: Record<string, any>;
}

export interface WebSocketStatus {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  attempts: number;
  lastError?: string;
}

export function useTenantFeed(wsUrl?: string, token?: string, tenantId?: string) {
  const defaultWsUrl = wsUrl || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  
  const [status, setStatus] = useState<WebSocketStatus>({
    status: 'connecting',
    attempts: 0
  });
  
  const [events, setEvents] = useState<WebSocketEvent[]>([]);
  const [busConfig, setBusConfig] = useState<any>(null);

  const connect = useCallback(() => {
    if (!token) {
      setStatus({ status: 'error', attempts: 0, lastError: 'No admin token provided - check ADMIN_JWT_SECRET' });
      return;
    }

    // Validate token format before connecting
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload || !payload.role) {
        throw new Error('Invalid admin token format');
      }
    } catch (error) {
      setStatus({ 
        status: 'error', 
        attempts: 0, 
        lastError: `Token validation failed: ${error instanceof Error ? error.message : 'Invalid format'}` 
      });
      return;
    }

    try {
      const ws = new WebSocket(`${defaultWsUrl}/api/admin/feed?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Admin WebSocket connected');
        setStatus({ status: 'connected', attempts: reconnectAttempts.current });
        reconnectAttempts.current = 0;
        
        // Check backpressure before sending auth
        if (ws.bufferedAmount > 1024 * 1024) { // 1MB
          console.warn('WebSocket backpressure too high, closing connection');
          ws.close(4000, 'backpressure');
          return;
        }
        
        // Send authentication if token available
        if (token) {
          ws.send(JSON.stringify({
            type: 'auth',
            token: token,
            tenant_id: tenantId || 'default'
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'ready') {
            // Store bus configuration
            setBusConfig({
              bus_type: message.bus_type,
              production_ready: message.production_ready,
              tenant_id: message.tenant_id
            });
          } else if (message.type === 'activity' && message.data) {
            // Add new activity event
            setEvents(prevEvents => {
              const newEvent = message.data as WebSocketEvent;
              const filtered = [newEvent, ...prevEvents].slice(0, 200); // Keep last 200 events
              return filtered;
            });
          } else if (message.type === 'pong') {
            // Handle ping/pong
            console.log('WebSocket ping/pong successful');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus(prev => ({
          ...prev,
          status: 'error',
          lastError: 'WebSocket connection error'
        }));
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setStatus(prev => ({
          ...prev,
          status: 'disconnected',
          attempts: reconnectAttempts.current
        }));
        wsRef.current = null;

        // Implement exponential backoff for reconnection: 0.5s → 1s → 2s → 4s → 8s, capped at 10s
        if (reconnectAttempts.current < 5) {
          const backoffDelay = Math.min(
            10000, // Max 10 seconds
            500 * Math.pow(2, reconnectAttempts.current) // 0.5s, 1s, 2s, 4s, 8s
          );

          reconnectAttempts.current++;
          setStatus(prev => ({
            ...prev,
            status: 'connecting',
            attempts: reconnectAttempts.current
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, backoffDelay);
        } else {
          setStatus(prev => ({
            ...prev,
            status: 'error',
            lastError: 'Max reconnection attempts reached'
          }));
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setStatus(prev => ({
        ...prev,
        status: 'error',
        lastError: 'Failed to create WebSocket connection'
      }));
    }
  }, [defaultWsUrl, token, tenantId]);

  // Filter events by type for different modules
  const getEventsByType = useCallback((types: string | string[]) => {
    const typeArray = Array.isArray(types) ? types : [types];
    return events.filter(event => typeArray.includes(event.type));
  }, [events]);

  // Get events for specific tenant (with fallback to all events)
  const getTenantEvents = useCallback((targetTenantId?: string) => {
    if (!targetTenantId) return events;
    return events.filter(event => 
      event.tenant_id === targetTenantId || event.tenant_id === 'default'
    );
  }, [events]);

  // Send ping to keep connection alive
  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Check backpressure before sending
      if (wsRef.current.bufferedAmount > 1024 * 1024) { // 1MB
        console.warn('WebSocket backpressure too high, closing connection');
        wsRef.current.close(4000, 'backpressure');
        return;
      }
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  // Manually reconnect
  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttempts.current = 0;
    setStatus({ status: 'connecting', attempts: 0 });
    connect();
  }, [connect]);

  // Clear events (useful for refresh operations)
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    connect();

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(sendPing, 30000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, sendPing]);

  return {
    status,
    events,
    busConfig,
    connect,
    reconnect,
    clearEvents,
    sendPing,
    getEventsByType,
    getTenantEvents
  };
}