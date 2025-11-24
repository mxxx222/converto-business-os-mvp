import { z } from "zod";

export const CapabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  owner: z.string(), // module ID
  version: z.string(),
  api: z.object({
    baseUrl: z.string(),
    openApiSpec: z.string().optional(),
    version: z.string(),
  }).optional(),
  events: z.array(z.object({
    name: z.string(),
    version: z.string(),
    schema: z.record(z.any()),
  })).default([]),
  permissions: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  status: z.enum(["active", "deprecated", "disabled"]).default("active"),
  lastUpdated: z.string(),
});

export type Capability = z.infer<typeof CapabilitySchema>;

export class CapabilityRegistry {
  private capabilities = new Map<string, Capability>();
  private routes = new Map<string, string>(); // route -> capability ID
  private conflicts = new Set<string>();

  register(capability: Capability): void {
    // Check for route conflicts
    if (capability.api?.baseUrl) {
      const existingOwner = this.routes.get(capability.api.baseUrl);
      if (existingOwner && existingOwner !== capability.id) {
        this.conflicts.add(`${capability.api.baseUrl}: ${existingOwner} vs ${capability.id}`);
        console.warn(`🚨 Route conflict detected: ${capability.api.baseUrl}`);
      }
      this.routes.set(capability.api.baseUrl, capability.id);
    }

    this.capabilities.set(capability.id, capability);
    console.log(`✅ Registered capability: ${capability.name} (${capability.id})`);
  }

  getCapability(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }

  getOwner(route: string): string | undefined {
    return this.routes.get(route);
  }

  getAllCapabilities(): Capability[] {
    return Array.from(this.capabilities.values());
  }

  getConflicts(): string[] {
    return Array.from(this.conflicts);
  }

  getCapabilitiesByOwner(owner: string): Capability[] {
    return Array.from(this.capabilities.values())
      .filter(cap => cap.owner === owner);
  }

  getDependencies(capabilityId: string): Capability[] {
    const capability = this.capabilities.get(capabilityId);
    if (!capability) return [];

    return capability.dependencies
      .map(depId => this.capabilities.get(depId))
      .filter(Boolean) as Capability[];
  }

  validateOwnership(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const ownerCount = new Map<string, number>();

    // Count capabilities per owner
    for (const cap of this.capabilities.values()) {
      const count = ownerCount.get(cap.owner) || 0;
      ownerCount.set(cap.owner, count + 1);
    }

    // Check for single ownership
    for (const [owner, count] of ownerCount.entries()) {
      if (count > 1) {
        issues.push(`Multiple capabilities owned by ${owner}: ${count} capabilities`);
      }
    }

    // Check for orphaned capabilities
    for (const cap of this.capabilities.values()) {
      if (cap.dependencies.length > 0) {
        const missingDeps = cap.dependencies.filter(depId => !this.capabilities.has(depId));
        if (missingDeps.length > 0) {
          issues.push(`Missing dependencies for ${cap.id}: ${missingDeps.join(', ')}`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Global registry instance
export const capabilityRegistry = new CapabilityRegistry();
