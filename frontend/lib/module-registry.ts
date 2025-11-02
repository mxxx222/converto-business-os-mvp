/**
 * Module Registry - Single Source of Truth
 *
 * Defines all available modules, their pricing, limits, and UI components.
 * Used by dashboard, billing, and marketplace.
 */

export interface ModuleDefinition {
  moduleId: string;
  name: string;
  description: string;
  price: number; // in cents
  limits: Record<string, any>;
  component?: React.ComponentType<any>;
  permissions: string[];
  marketplaceVerified?: boolean;
}

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  'ai-sales-assistant': {
    moduleId: 'ai-sales-assistant',
    name: 'AI Sales Assistant',
    description: 'Automated lead qualification and personalized follow-up sequences',
    price: 3900, // $39/month
    limits: { responses: 1000 },
    permissions: ['sales.write'],
    marketplaceVerified: true,
  },

  'crm-sync': {
    moduleId: 'crm-sync',
    name: 'CRM Integration',
    description: 'Bidirectional sync with HubSpot, Salesforce, and Pipedrive',
    price: 4900, // $49/month
    limits: { syncs: 100 },
    permissions: ['crm.read', 'crm.write'],
    marketplaceVerified: true,
  },

  'advanced-analytics': {
    moduleId: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Custom dashboards, cohort analysis, and funnel tracking',
    price: 5900, // $59/month
    limits: {},
    permissions: ['analytics.read'],
    marketplaceVerified: true,
  },

  'white-label': {
    moduleId: 'white-label',
    name: 'White Label',
    description: 'Custom branding, SSO integration, and domain mapping',
    price: 9900, // $99/month
    limits: {},
    permissions: ['branding.write'],
    marketplaceVerified: true,
  },

  'ai-chat-bot': {
    moduleId: 'ai-chat-bot',
    name: 'AI Chat Bot',
    description: 'Smart conversational agent for customer support',
    price: 4500,
    limits: { conversations: 500 },
    permissions: ['support.write'],
    marketplaceVerified: false,
  },

  'email-automation': {
    moduleId: 'email-automation',
    name: 'Email Automation',
    description: 'Multi-step email campaigns and drip sequences',
    price: 3500,
    limits: { emails: 10000 },
    permissions: ['email.write'],
    marketplaceVerified: false,
  },
};

/**
 * Get module by ID
 */
export function getModule(moduleId: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY[moduleId];
}

/**
 * Get all modules
 */
export function getAllModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY);
}

/**
 * Get modules by tier
 */
export function getModulesByTier(tier: 'starter' | 'pro' | 'scale'): ModuleDefinition[] {
  const tierLimits = {
    starter: 0,
    pro: 3,
    scale: 10,
  };

  return getAllModules().slice(0, tierLimits[tier]);
}

/**
 * Check if module is included in tier
 */
export function isModuleIncluded(moduleId: string, tier: 'starter' | 'pro' | 'scale'): boolean {
  const includedModules = getModulesByTier(tier);
  return includedModules.some(m => m.moduleId === moduleId);
}

/**
 * Get module pricing display
 */
export function getModulePriceDisplay(module: ModuleDefinition): string {
  return `$${(module.price / 100).toFixed(0)}/month`;
}

/**
 * Get tier pricing
 */
export const TIER_PRICING = {
  starter: { price: 9900, name: 'Starter', includedModules: 0 },
  pro: { price: 29900, name: 'Pro', includedModules: 3 },
  scale: { price: 99900, name: 'Scale', includedModules: 10 },
};
