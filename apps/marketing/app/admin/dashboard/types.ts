/**
 * Type definitions for Admin Dashboard Activity Feed
 */

export type ActivityType = 
  | 'upload'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'export_scheduled'
  | 'user_action'
  | 'system_event'
  | 'error'
  | 'warning'
  | 'info';

export type ActivityStatus = 
  | 'success'
  | 'pending'
  | 'failed'
  | 'warning'
  | 'info';

export interface Activity {
  id: string;
  type: ActivityType;
  status: ActivityStatus;
  timestamp: string;
  title?: string;
  details?: string;
  metadata?: Record<string, unknown>;
  tenantId?: string;
  userId?: string;
}

export interface ActivityResponse {
  activities: Activity[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface WebSocketMessage {
  type: 'activity' | 'error' | 'ready' | 'pong' | 'ping';
  data?: Activity;
  message?: string;
  bus_type?: string;
  production_ready?: boolean;
  tenant_id?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
}

