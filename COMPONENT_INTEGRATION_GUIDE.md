# 🎨 Component Integration Guide

## How to Add Status Chips to Any Page

### Quick Integration (Recommended)

Use the `UnifiedHeader` component for consistent header across all pages:

```tsx
import { UnifiedHeader } from "@/components/UnifiedHeader";

export default function MyPage() {
  return (
    <div>
      <UnifiedHeader
        title="My Page"
        confidence={0.95}
        showQuickReplies={true}
      />

      {/* Your page content */}
    </div>
  );
}
```

---

## Manual Integration (Custom Layout)

If you need more control, add components individually:

### Step 1: Import Components

```tsx
import {
  ProviderChip,
  PrivacyChip,
  LatencyChip,
  ConfidenceChip
} from "@/components/StatusChips";
import { QuickReplies } from "@/components/CommandPalette";
```

### Step 2: Add Status Bar (Desktop)

```tsx
<div className="hidden md:block bg-white/80 backdrop-blur-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 py-3">
    <div className="flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <ProviderChip showLatency={true} />
        <PrivacyChip />
      </div>

      {/* Right side */}
      <ConfidenceChip confidence={0.92} />
    </div>
  </div>
</div>
```

### Step 3: Add Quick Actions (Mobile)

```tsx
<div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
  <QuickReplies />
</div>
```

---

## Component Props

### ProviderChip

```tsx
<ProviderChip
  aiProvider="openai"      // optional, auto-detected
  visionProvider="ollama"  // optional, auto-detected
  showLatency={true}       // show latency sparkline
/>
```

### PrivacyChip

```tsx
<PrivacyChip />  // No props, auto-detects local mode
```

### LatencyChip

```tsx
<LatencyChip
  latencies={[120, 150, 130, 145, 125]}  // Array of latencies (ms)
/>
```

### ConfidenceChip

```tsx
<ConfidenceChip
  confidence={0.95}  // 0-1 (displays as percentage)
/>
```

### RiskFlag

```tsx
<RiskFlag level="low" />     // "low" | "medium" | "high"
```

---

## Page-Specific Integration

### Dashboard (`/dashboard`)

```tsx
import { UnifiedHeader } from "@/components/UnifiedHeader";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <UnifiedHeader
        confidence={0.92}
        showQuickReplies={true}
      />

      {/* Hero Section */}
      {/* Stats Cards */}
      {/* Features Grid */}
    </div>
  );
}
```

### OCR Page (`/selko/ocr`)

```tsx
import { UnifiedHeader } from "@/components/UnifiedHeader";

export default function OCRPage() {
  return (
    <div className="min-h-screen">
      <UnifiedHeader
        title="Kuittiskannaus"
        confidence={0.94}
        showQuickReplies={true}
      />

      {/* Dropzone */}
      {/* Results */}
    </div>
  );
}
```

### VAT Page (`/vat`)

```tsx
import { UnifiedHeader } from "@/components/UnifiedHeader";

export default function VATPage() {
  return (
    <div className="min-h-screen">
      <UnifiedHeader
        title="ALV-laskuri"
        confidence={0.98}
        showQuickReplies={true}
      />

      {/* VAT Calculator */}
      {/* Reports */}
    </div>
  );
}
```

### Legal Page (`/legal`)

```tsx
import { UnifiedHeader } from "@/components/UnifiedHeader";

export default function LegalPage() {
  return (
    <div className="min-h-screen">
      <UnifiedHeader
        title="Legal Compliance"
        confidence={0.96}
        showQuickReplies={true}
      />

      {/* Compliance Dashboard */}
      {/* Rules List */}
    </div>
  );
}
```

---

## Responsive Behavior

### Desktop (≥768px)
- Status chips in top bar
- Horizontal layout
- All chips visible
- Hover effects active

### Mobile (<768px)
- Quick Replies scrollable bar
- Vertical stacking
- Icons prioritized
- Touch-optimized

---

## Customization Examples

### Custom Confidence Display

```tsx
import { useState, useEffect } from "react";

export default function OCRPage() {
  const [confidence, setConfidence] = useState(0.92);

  useEffect(() => {
    // Update confidence after OCR
    async function processReceipt() {
      const result = await scanReceipt();
      setConfidence(result.confidence);
    }
  }, []);

  return (
    <div>
      <UnifiedHeader confidence={confidence} />
      {/* ... */}
    </div>
  );
}
```

### Custom Quick Actions

```tsx
import { QuickReplies } from "@/components/CommandPalette";

<QuickReplies
  items={[
    { label: "📸 Scan", action: () => openCamera() },
    { label: "📁 Import", action: () => openFilePicker() },
    { label: "📊 Reports", href: "/reports" }
  ]}
/>
```

### Hide Quick Replies on Specific Pages

```tsx
<UnifiedHeader
  title="Admin Panel"
  confidence={1.0}
  showQuickReplies={false}  // No quick actions
/>
```

---

## Styling & Theming

### Custom Background

```tsx
<div className="bg-gradient-to-r from-purple-500 to-pink-500">
  <UnifiedHeader />
</div>
```

### Sticky Header

```tsx
<div className="sticky top-0 z-50">
  <UnifiedHeader />
</div>
```

### Dark Mode Support

```tsx
<div className="dark:bg-gray-900 dark:border-gray-800">
  <UnifiedHeader />
</div>
```

---

## Testing Checklist

After integrating components:

- [ ] Desktop view shows status chips
- [ ] Mobile view shows Quick Replies
- [ ] Command Palette (⌘K) still works
- [ ] Chips update in real-time
- [ ] Confidence % changes correctly
- [ ] Privacy chip shows when local
- [ ] Provider chips show correct provider
- [ ] Latency updates every 5s
- [ ] Quick Replies navigate correctly
- [ ] Touch interactions work (mobile)
- [ ] No console errors
- [ ] Performance is smooth (60fps)

---

## Common Issues & Solutions

### Chips not showing?

**Check API is running:**
```bash
curl http://localhost:8000/api/v1/ai/whoami
curl http://localhost:8000/api/v1/vision/whoami
```

**Check imports:**
```tsx
import { ProviderChip } from "@/components/StatusChips";
```

### Quick Replies not working?

**Check CommandPalette export:**
```tsx
// components/CommandPalette.tsx
export function QuickReplies() { /* ... */ }
```

**Verify import:**
```tsx
import { QuickReplies } from "@/components/CommandPalette";
```

### Styling broken?

**Check Tailwind classes:**
```bash
npm run dev  # Rebuilds CSS
```

**Clear cache:**
```bash
rm -rf .next
npm run dev
```

---

## Performance Tips

1. **Lazy load status chips:**
```tsx
const StatusChips = dynamic(() => import("@/components/StatusChips"));
```

2. **Memoize provider data:**
```tsx
const providerData = useMemo(() => fetchProviderInfo(), []);
```

3. **Debounce confidence updates:**
```tsx
const debouncedConfidence = useDebounce(confidence, 500);
```

---

## Next Steps

1. Add `UnifiedHeader` to remaining pages
2. Customize confidence per page type
3. Add page-specific quick actions
4. Test on real devices
5. Gather user feedback

---

## Support

Questions? Check:
- Component code: `frontend/components/`
- Usage examples: This file
- UI utilities: `frontend/lib/ui.ts`
