/**
 * Event Bus - Global Async Event Emitter
 *
 * System-wide event broadcasting for:
 * - Module activations
 * - Usage tracking
 * - Billing updates
 * - Analytics
 * - Notifications
 */

type EventPayload = Record<string, any>;
type EventCallback = (payload: EventPayload) => void | Promise<void>;

class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();
  private asyncListeners: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to event
   */
  on(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to event (async - fire and forget)
   */
  onAsync(eventType: string, callback: EventCallback): () => void {
    if (!this.asyncListeners.has(eventType)) {
      this.asyncListeners.set(eventType, []);
    }

    this.asyncListeners.get(eventType)!.push(callback);

    return () => {
      const callbacks = this.asyncListeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emit event
   */
  async emit(eventType: string, payload: EventPayload = {}): Promise<void> {
    // Sync listeners
    const syncCallbacks = this.listeners.get(eventType) || [];
    for (const callback of syncCallbacks) {
      try {
        await callback(payload);
      } catch (error) {
        console.error(`Error in sync listener for ${eventType}:`, error);
      }
    }

    // Async listeners (fire and forget)
    const asyncCallbacks = this.asyncListeners.get(eventType) || [];
    for (const callback of asyncCallbacks) {
      // Run async, don't await
      const result = callback(payload);
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error(`Error in async listener for ${eventType}:`, error);
        });
      }
    }

    // Log to backend for analytics
    this.logToBackend(eventType, payload).catch((error) => {
      console.error(`Error logging event to backend:`, error);
    });
  }

  /**
   * Log event to backend
   */
  private async logToBackend(eventType: string, payload: EventPayload): Promise<void> {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          payload: {
            ...payload,
            timestamp: Date.now(),
          },
        }),
      });
    } catch (error) {
      // Silent fail - analytics is not critical
      console.debug('Event logging failed:', error);
    }
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear();
    this.asyncListeners.clear();
  }
}

// Singleton instance
export const eventBus = new EventBus();

/**
 * Common event types
 */
export const EventTypes = {
  // Module events
  MODULE_ACTIVATED: 'module_activated',
  MODULE_DEACTIVATED: 'module_deactivated',
  MODULE_USED: 'module_used',

  // Billing events
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  USAGE_RECORDED: 'usage_recorded',

  // Team events
  TEAM_CREATED: 'team_created',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  ROLE_CHANGED: 'role_changed',

  // Analytics events
  FEATURE_USED: 'feature_used',
  PAGE_VIEWED: 'page_viewed',
  USER_LOGIN: 'user_login',

  // Audit events
  PERMISSION_DENIED: 'permission_denied',
  SETTINGS_CHANGED: 'settings_changed',
} as const;

/**
 * Helper to emit typed events
 */
export const emitEvent = eventBus.emit.bind(eventBus);

/**
 * Helper to subscribe to events
 */
export const onEvent = eventBus.on.bind(eventBus);

export default eventBus;
