/**
 * TypeScript type definitions for Activity Feed
 */

export type ActivityType = 
  | 'upload' 
  | 'ocr_completed' 
  | 'ocr_failed' 
  | 'error' 
  | 'analysis_started' 
  | 'export_generated';

export type ActivityStatus = 
  | 'success' 
  | 'error' 
  | 'failed' 
  | 'pending' 
  | 'processing' 
  | 'warning';

export interface Activity {
  id: string;
  type: ActivityType;
  action: string;
  user_id: string;
  user_email?: string;
  details: Record<string, string | number | boolean | null | undefined>;
  status: ActivityStatus;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface ActivityResponse {
  activities: Activity[];
  total: number;
  limit: number;
  offset: number;
}

export interface WebSocketMessage {
  type: 'activity' | 'ping' | 'error';
  data?: Activity;
  message?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
}