import { z } from "zod";

export const KillSwitchSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean(),
  scope: z.enum(["global", "capability", "user", "tenant"]),
  target: z.string().optional(), // capability ID, user ID, or tenant ID
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
    value: z.any(),
  })).default([]),
  fallback: z.object({
    status: z.number(),
    message: z.string(),
    data: z.any().optional(),
  }),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type KillSwitch = z.infer<typeof KillSwitchSchema>;

export class KillSwitchManager {
  private switches = new Map<string, KillSwitch>();
  private globalEnabled = true;

  create(switchData: Omit<KillSwitch, 'id' | 'createdAt' | 'updatedAt'>): KillSwitch {
    const killSwitch: KillSwitch = {
      ...switchData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.switches.set(killSwitch.id, killSwitch);
    
    auditTrail.log({
      action: "kill_switch_created",
      resource: "kill_switch",
      resourceId: killSwitch.id,
      changes: { enabled: killSwitch.enabled, scope: killSwitch.scope },
      metadata: { name: killSwitch.name },
    });

    return killSwitch;
  }

  update(id: string, updates: Partial<Omit<KillSwitch, 'id' | 'createdAt'>>): KillSwitch | null {
    const existing = this.switches.get(id);
    if (!existing) return null;

    const updated: KillSwitch = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.switches.set(id, updated);

    auditTrail.log({
      action: "kill_switch_updated",
      resource: "kill_switch",
      resourceId: id,
      changes: this.getDiff(existing, updated),
    });

    return updated;
  }

  delete(id: string): boolean {
    const existing = this.switches.get(id);
    if (!existing) return false;

    this.switches.delete(id);

    auditTrail.log({
      action: "kill_switch_deleted",
      resource: "kill_switch",
      resourceId: id,
      changes: { deleted: true },
    });

    return true;
  }

  check(context: {
    capability?: string;
    userId?: string;
    tenantId?: string;
    metadata?: Record<string, any>;
  }): {
    blocked: boolean;
    reason?: string;
    fallback?: KillSwitch['fallback'];
  } {
    // Check global kill switch first
    if (!this.globalEnabled) {
      return {
        blocked: true,
        reason: "Global kill switch is disabled",
        fallback: {
          status: 503,
          message: "Service temporarily unavailable",
        }
      };
    }

    // Check capability-specific switches
    if (context.capability) {
      const capabilitySwitch = Array.from(this.switches.values())
        .find(ks => ks.scope === "capability" && ks.target === context.capability && ks.enabled);
      
      if (capabilitySwitch) {
        if (this.evaluateConditions(capabilitySwitch.conditions, context.metadata || {})) {
          return {
            blocked: true,
            reason: `Capability ${context.capability} is disabled`,
            fallback: capabilitySwitch.fallback,
          };
        }
      }
    }

    // Check user-specific switches
    if (context.userId) {
      const userSwitch = Array.from(this.switches.values())
        .find(ks => ks.scope === "user" && ks.target === context.userId && ks.enabled);
      
      if (userSwitch) {
        if (this.evaluateConditions(userSwitch.conditions, context.metadata || {})) {
          return {
            blocked: true,
            reason: `User ${context.userId} is blocked`,
            fallback: userSwitch.fallback,
          };
        }
      }
    }

    // Check tenant-specific switches
    if (context.tenantId) {
      const tenantSwitch = Array.from(this.switches.values())
        .find(ks => ks.scope === "tenant" && ks.target === context.tenantId && ks.enabled);
      
      if (tenantSwitch) {
        if (this.evaluateConditions(tenantSwitch.conditions, context.metadata || {})) {
          return {
            blocked: true,
            reason: `Tenant ${context.tenantId} is disabled`,
            fallback: tenantSwitch.fallback,
          };
        }
      }
    }

    return { blocked: false };
  }

  private evaluateConditions(conditions: KillSwitch['conditions'], metadata: Record<string, any>): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      const value = metadata[condition.field];
      
      switch (condition.operator) {
        case "equals":
          return value === condition.value;
        case "not_equals":
          return value !== condition.value;
        case "contains":
          return String(value).includes(String(condition.value));
        case "greater_than":
          return Number(value) > Number(condition.value);
        case "less_than":
          return Number(value) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  private getDiff(before: any, after: any): Record<string, { from: any; to: any }> {
    const diff: Record<string, { from: any; to: any }> = {};
    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

    for (const key of allKeys) {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        diff[key] = { from: before[key], to: after[key] };
      }
    }

    return diff;
  }

  setGlobalEnabled(enabled: boolean): void {
    this.globalEnabled = enabled;
    
    auditTrail.log({
      action: "global_kill_switch_toggled",
      resource: "system",
      changes: { globalEnabled: enabled },
    });
  }

  getAllSwitches(): KillSwitch[] {
    return Array.from(this.switches.values());
  }

  getActiveSwitches(): KillSwitch[] {
    return Array.from(this.switches.values()).filter(ks => ks.enabled);
  }
}

// Global kill switch manager
export const killSwitchManager = new KillSwitchManager();
