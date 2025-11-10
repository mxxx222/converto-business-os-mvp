'use client';

/**
 * ActivityFeed Component
 * Real-time activity feed with WebSocket support
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Activity, ActivityResponse, WebSocketMessage, ConnectionStatus } from './types';
import {
  formatTime,
  getActivityIcon,
  getActivityTitle,
  getActivityDetails,
  getStatusBadge,
  getActivityTypeClass
} from './activityHelpers';
import styles from './styles.module.css';

interface ActivityFeedProps {
  apiUrl?: string;
  wsUrl?: string;
  maxActivities?: number;
  refreshInterval?: number;
}

export default function ActivityFeed({
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  maxActivities = 50,
  refreshInterval = 30000 // 30 seconds
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch activities from API
  const fetchActivities = useCallback(async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${apiUrl}/api/admin/activities?limit=20`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ActivityResponse = await response.json();
      setActivities(data.activities);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    fetchActivities();
  }, [fetchActivities]);

  // WebSocket connection with reconnection logic
  const connectWebSocket = useCallback(() => {
    // Prevent multiple connections
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(`${wsUrl}/admin/feed`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus({ connected: true, reconnecting: false });
        reconnectAttemptsRef.current = 0;
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'activity' && message.data) {
            // Add new activity to the beginning of the list
            setActivities(prevActivities => {
              const newActivities = [message.data!, ...prevActivities];
              // Keep only the max number of activities
              return newActivities.slice(0, maxActivities);
            });
          } else if (message.type === 'error') {
            console.error('WebSocket error message:', message.message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus(prev => ({
          ...prev,
          error: 'WebSocket connection error'
        }));
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionStatus({ connected: false, reconnecting: true });
        wsRef.current = null;

        // Implement exponential backoff for reconnection
        const backoffDelay = Math.min(
          1500 * Math.pow(1.5, reconnectAttemptsRef.current),
          30000 // Max 30 seconds
        );

        console.log(`Reconnecting in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current + 1})`);

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectWebSocket();
        }, backoffDelay);
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setConnectionStatus({
        connected: false,
        reconnecting: false,
        error: 'Failed to create WebSocket connection'
      });
    }
  }, [wsUrl, maxActivities]);

  // Initial data fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      // Cleanup WebSocket on unmount
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Auto-refresh interval
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      // Only refresh if WebSocket is not connected
      if (!connectionStatus.connected) {
        fetchActivities();
      }
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [connectionStatus.connected, fetchActivities, refreshInterval]);

  // Render connection status indicator
  const renderConnectionStatus = () => {
    if (connectionStatus.connected) {
      return (
        <div className={styles.statusConnected}>
          <span className={styles.statusDot}>🟢</span>
          <span>Live</span>
        </div>
      );
    } else if (connectionStatus.reconnecting) {
      return (
        <div className={styles.statusReconnecting}>
          <span className={styles.statusDot}>🟡</span>
          <span>Yhdistetään uudelleen...</span>
        </div>
      );
    } else {
      return (
        <div className={styles.statusDisconnected}>
          <span className={styles.statusDot}>🔴</span>
          <span>Ei yhteyttä</span>
        </div>
      );
    }
  };

  // Render activity item
  const renderActivity = (activity: Activity) => {
    const icon = getActivityIcon(activity.type);
    const title = getActivityTitle(activity);
    const details = getActivityDetails(activity);
    const timestamp = formatTime(activity.timestamp);
    const statusBadge = getStatusBadge(activity.status);
    const typeClass = getActivityTypeClass(activity.type);

    return (
      <div key={activity.id} className={`${styles.activityItem} ${styles[typeClass]}`}>
        <div className={styles.activityIcon}>{icon}</div>
        <div className={styles.activityContent}>
          <div className={styles.activityHeader}>
            <h3 className={styles.activityTitle}>{title}</h3>
            <span className={`${styles.statusBadge} ${styles[statusBadge.className]}`}>
              {statusBadge.text}
            </span>
          </div>
          <p className={styles.activityDetails}>{details}</p>
          <span className={styles.activityTimestamp}>{timestamp}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.activityFeed}>
      {/* Header */}
      <div className={styles.feedHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.feedTitle}>📊 Reaaliaikainen Aktiviteetti</h2>
          {renderConnectionStatus()}
        </div>
        <button 
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={isLoading}
          aria-label="Päivitä aktiviteetit"
        >
          {isLoading ? '⏳' : '🔄'} Päivitä
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && activities.length === 0 && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Ladataan aktiviteetteja...</p>
        </div>
      )}

      {/* Activities List */}
      {!isLoading && activities.length === 0 && !error && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <p>Ei aktiviteetteja</p>
        </div>
      )}

      {activities.length > 0 && (
        <div className={styles.activitiesList}>
          {activities.map(renderActivity)}
        </div>
      )}
    </div>
  );
}