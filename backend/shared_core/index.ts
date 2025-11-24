// Capabilities
export { CapabilityRegistry, capabilityRegistry, type Capability } from "./capabilities/registry";

// Idempotency
export { 
  withIdempotency, 
  generateIdempotencyKey, 
  getIdempotencyKey, 
  validateIdempotencyKey,
  checkIdempotency,
  storeIdempotency
} from "./middleware/idempotency";

// Shadow Mode
export { ShadowMode, shadowMode } from "./observability/shadow-mode";

// Audit Trail
export { AuditTrail, auditTrail, type AuditEvent } from "./audit/trail";

// Kill Switches
export { KillSwitchManager, killSwitchManager, type KillSwitch } from "./controls/kill-switches";
