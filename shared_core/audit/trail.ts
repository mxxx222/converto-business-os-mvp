import { z } from "zod";

export const AuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  changes: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  idempotencyKey: z.string().optional(),
  traceId: z.string().optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

export class AuditTrail {
  private events: AuditEvent[] = [];
  private maxEvents: number;

  constructor(maxEvents: number = 10000) {
    this.maxEvents = maxEvents;
  }

  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this.events.push(auditEvent);

    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Structured logging
    console.log(JSON.stringify({
      type: "audit",
      ...auditEvent,
    }));
  }

  getEvents(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startTime?: string;
    endTime?: string;
  }): AuditEvent[] {
    let filtered = this.events;

    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter(e => e.userId === filters.userId);
      }
      if (filters.action) {
        filtered = filtered.filter(e => e.action === filters.action);
      }
      if (filters.resource) {
        filtered = filtered.filter(e => e.resource === filters.resource);
      }
      if (filters.startTime) {
        filtered = filtered.filter(e => e.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        filtered = filtered.filter(e => e.timestamp <= filters.endTime!);
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getChanges(resource: string, resourceId: string): AuditEvent[] {
    return this.events
      .filter(e => e.resource === resource && e.resourceId === resourceId)
      .filter(e => e.changes && Object.keys(e.changes).length > 0)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  getDiff(before: any, after: any): Record<string, { from: any; to: any }> {
    const diff: Record<string, { from: any; to: any }> = {};

    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

    for (const key of allKeys) {
      const beforeValue = before?.[key];
      const afterValue = after?.[key];

      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        diff[key] = {
          from: beforeValue,
          to: afterValue,
        };
      }
    }

    return diff;
  }

  generateReport(timeRange: { start: string; end: string }): {
    totalEvents: number;
    uniqueUsers: number;
    actions: Record<string, number>;
    resources: Record<string, number>;
    topChanges: Array<{ resource: string; count: number }>;
  } {
    const events = this.getEvents({
      startTime: timeRange.start,
      endTime: timeRange.end,
    });

    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
    
    const actions: Record<string, number> = {};
    const resources: Record<string, number> = {};
    
    events.forEach(event => {
      actions[event.action] = (actions[event.action] || 0) + 1;
      resources[event.resource] = (resources[event.resource] || 0) + 1;
    });

    const topChanges = Object.entries(resources)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([resource, count]) => ({ resource, count }));

    return {
      totalEvents: events.length,
      uniqueUsers,
      actions,
      resources,
      topChanges,
    };
  }
}

// Global audit trail instance
export const auditTrail = new AuditTrail();
