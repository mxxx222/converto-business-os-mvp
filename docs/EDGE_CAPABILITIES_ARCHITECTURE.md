# Edge Capabilities Layer - Replication Architecture

## 🏗️ Overview

This document outlines how the strategic edge capabilities (Business Graph, AI Voice, Themes, Gamification) can be replicated across other applications (billing, receipts, legal) while maintaining consistency and scalability.

## 🧩 Edge Capabilities Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    Edge Capabilities Layer                  │
├─────────────────────────────────────────────────────────────┤
│  Business Graph  │  AI Voice    │  Theme Engine  │  Gamification │
│  (D3.js)         │  (Speech API) │  (CSS Props)   │  (Zustand)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Dashboard      │  Billing      │  Receipts      │  Legal        │
│  (Implemented)  │  (Target)     │  (Target)      │  (Target)     │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Replication Strategy

### 1. Shared Libraries Approach

Create a shared package `@converto/edge-capabilities` containing:

```
packages/edge-capabilities/
├── src/
│   ├── business-graph/
│   │   ├── BusinessGraph.tsx
│   │   ├── useBusinessGraph.ts
│   │   └── types.ts
│   ├── voice-commands/
│   │   ├── VoiceCommands.tsx
│   │   ├── useVoiceCommands.ts
│   │   └── commands.ts
│   ├── theme/
│   │   ├── ThemeProvider.tsx
│   │   ├── useTheme.ts
│   │   └── themes.json
│   └── gamification/
│       ├── AchievementProvider.tsx
│       ├── useAchievements.ts
│       └── store.ts
├── package.json
└── tsconfig.json
```

### 2. Application-Specific Adaptations

Each app adapts the edge capabilities to its domain:

#### Billing App
```typescript
// apps/billing/components/BillingVoiceCommands.tsx
import { VoiceCommands } from '@converto/edge-capabilities/voice-commands';

const BILLING_COMMANDS = [
  { phrase: "create invoice", action: "create_invoice", xpReward: 30 },
  { phrase: "send reminder", action: "send_reminder", xpReward: 20 },
  { phrase: "view payments", action: "view_payments", xpReward: 10 },
];

export function BillingVoiceCommands() {
  return <VoiceCommands commands={BILLING_COMMANDS} />;
}
```

#### Receipts App
```typescript
// apps/receipts/components/ReceiptsBusinessGraph.tsx
import { BusinessGraph } from '@converto/edge-capabilities/business-graph';

const RECEIPT_NODE_TYPES = {
  receipt: "#8b5cf6",
  category: "#10b981", 
  vendor: "#f59e0b",
  tax: "#ef4444"
};

export function ReceiptsBusinessGraph() {
  return (
    <BusinessGraph 
      nodeTypes={RECEIPT_NODE_TYPES}
      dataEndpoint="/api/receipts/graph-data"
    />
  );
}
```

#### Legal App
```typescript
// apps/legal/components/LegalGamification.tsx
import { useAchievements } from '@converto/edge-capabilities/gamification';

const LEGAL_ACHIEVEMENTS = [
  { id: "first_contract", name: "Contract Creator", xpReward: 50 },
  { id: "legal_review", name: "Legal Reviewer", xpReward: 75 },
];

export function LegalGamification() {
  const { addXP, unlockAchievement } = useAchievements();
  // Legal-specific gamification logic
}
```

## 🔧 Implementation Plan

### Phase 1: Shared Package Creation
1. **Extract Components**: Move edge capabilities to shared package
2. **Create Interfaces**: Define generic interfaces for each capability
3. **Setup Build**: Configure TypeScript and build pipeline
4. **Version Management**: Use semantic versioning for updates

### Phase 2: Application Integration
1. **Dashboard Migration**: Update dashboard to use shared package
2. **Billing Integration**: Add edge capabilities to billing app
3. **Receipts Integration**: Add edge capabilities to receipts app
4. **Legal Integration**: Add edge capabilities to legal app

### Phase 3: Cross-App Features
1. **Unified Gamification**: Shared XP and achievements across apps
2. **Cross-App Voice Commands**: Navigate between apps via voice
3. **Unified Theme System**: Consistent theming across all apps
4. **Cross-App Business Graph**: Unified view of all business data

## 📦 Package Structure

### @converto/edge-capabilities

```json
{
  "name": "@converto/edge-capabilities",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    "./business-graph": "./dist/business-graph/index.js",
    "./voice-commands": "./dist/voice-commands/index.js",
    "./theme": "./dist/theme/index.js",
    "./gamification": "./dist/gamification/index.js"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0"
  }
}
```

### Usage in Applications

```typescript
// apps/billing/package.json
{
  "dependencies": {
    "@converto/edge-capabilities": "^1.0.0"
  }
}

// apps/billing/components/App.tsx
import { BusinessGraph } from '@converto/edge-capabilities/business-graph';
import { VoiceCommands } from '@converto/edge-capabilities/voice-commands';
import { ThemeProvider } from '@converto/edge-capabilities/theme';
import { AchievementProvider } from '@converto/edge-capabilities/gamification';

export function BillingApp() {
  return (
    <ThemeProvider tenantId="billing-tenant">
      <AchievementProvider>
        <VoiceCommands commands={BILLING_COMMANDS} />
        <BusinessGraph dataEndpoint="/api/billing/graph" />
        {/* Billing-specific content */}
      </AchievementProvider>
    </ThemeProvider>
  );
}
```

## 🎯 Domain-Specific Adaptations

### Business Graph Variations

| App | Node Types | Relationships | Data Source |
|-----|------------|---------------|-------------|
| Dashboard | orders, receipts, taxes, customers, vendors | financial flows | `/api/dashboard/graph` |
| Billing | invoices, payments, customers, products | payment flows | `/api/billing/graph` |
| Receipts | receipts, categories, vendors, taxes | expense flows | `/api/receipts/graph` |
| Legal | contracts, clauses, parties, obligations | legal relationships | `/api/legal/graph` |

### Voice Commands by Domain

| App | Commands | Actions |
|-----|----------|---------|
| Dashboard | "upload receipt", "show analytics", "create invoice" | navigation, data input |
| Billing | "create invoice", "send reminder", "view payments" | invoice management |
| Receipts | "scan receipt", "categorize", "export data" | receipt processing |
| Legal | "create contract", "review clause", "send for signature" | legal document management |

### Theme Customizations

| App | Primary Color | Accent Color | Branding |
|-----|---------------|--------------|----------|
| Dashboard | Purple (#9333EA) | Teal (#14B8A6) | Main brand |
| Billing | Blue (#3B82F6) | Green (#10B981) | Financial |
| Receipts | Orange (#F59E0B) | Red (#EF4444) | Expense tracking |
| Legal | Indigo (#6366F1) | Purple (#8B5CF6) | Professional |

## 🚀 Migration Timeline

### Week 1-2: Shared Package
- [ ] Extract edge capabilities to shared package
- [ ] Create generic interfaces and types
- [ ] Setup build and testing pipeline
- [ ] Document usage patterns

### Week 3-4: Billing App
- [ ] Integrate shared edge capabilities
- [ ] Adapt voice commands for billing domain
- [ ] Create billing-specific business graph
- [ ] Implement billing gamification

### Week 5-6: Receipts App
- [ ] Integrate shared edge capabilities
- [ ] Adapt voice commands for receipts domain
- [ ] Create receipts-specific business graph
- [ ] Implement receipts gamification

### Week 7-8: Legal App
- [ ] Integrate shared edge capabilities
- [ ] Adapt voice commands for legal domain
- [ ] Create legal-specific business graph
- [ ] Implement legal gamification

### Week 9-10: Cross-App Features
- [ ] Unified gamification system
- [ ] Cross-app navigation via voice
- [ ] Unified theme management
- [ ] Cross-app business intelligence

## 📊 Success Metrics

### Technical Metrics
- **Code Reuse**: 80%+ shared code across applications
- **Bundle Size**: <5% increase per app with edge capabilities
- **Performance**: <100ms additional load time per capability
- **Maintainability**: Single source of truth for edge features

### Business Metrics
- **User Engagement**: +25% across all applications
- **Feature Adoption**: 60%+ users engage with edge capabilities
- **Cross-App Usage**: 40%+ users use multiple applications
- **Brand Consistency**: 100% consistent theming across apps

---

**Status**: 📋 **Architecture Ready** - Replication plan defined for all applications

This architecture ensures consistent, scalable deployment of strategic edge capabilities across the entire Converto platform while maintaining domain-specific adaptations and optimal user experiences.
