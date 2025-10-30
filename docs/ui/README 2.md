# 🎨 Converto™ UI Developer Handbook

**Version**: 2.0
**Last Updated**: October 2025
**Brand**: Converto Business OS

---

## 🎯 **Design Philosophy**

Converto UI is built on three principles:

1. **Clarity** - Every element has a clear purpose
2. **Professionalism** - Corporate-grade reliability
3. **Intelligence** - Data-driven, AI-powered interactions

---

## 🎨 **Brand Colors**

### **Primary Palette**

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Converto Blue | `#0047FF` | CTA buttons, links, accent |
| Secondary | Graphite Gray | `#444B5A` | Headers, icons, nav text |
| Background | Pure White | `#FFFFFF` | Main surface |
| Surface | Mist Gray | `#F5F6FA` | Cards, panels |
| Accent | Sky Blue | `#69B3FF` | Hover states, infographics |
| Success | Mint Green | `#2ECC71` | Success states, confirmations |
| Error | Alert Red | `#E74C3C` | Error messages |

### **Secondary Palette (Fixu™ Hybrid)**

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Neon Green | Fixu™ Green | `#39FF14` | Gamification, points, rewards |

---

## 🌞 **Light Theme (Default)**

```json
{
  "background": "#FFFFFF",
  "surface": "#F5F6FA",
  "textPrimary": "#0F1115",
  "textSecondary": "#444B5A",
  "accent": "#0047FF",
  "accentHover": "#0032B8",
  "border": "#E0E3EB",
  "ctaBackground": "#0047FF",
  "ctaText": "#FFFFFF"
}
```

**Feel**: Bright, calm, corporate trustworthiness
**Usage**: Desktop, daylight, offices, B2B presentations

---

## 🌙 **Dark Theme**

```json
{
  "background": "#0D1117",
  "surface": "#161B22",
  "textPrimary": "#F5F6FA",
  "textSecondary": "#A0A7B4",
  "accent": "#69B3FF",
  "accentHover": "#89C8FF",
  "border": "#2B3038",
  "ctaBackground": "#0047FF",
  "ctaText": "#FFFFFF"
}
```

**Feel**: Modern, technical, high-contrast
**Usage**: Night mode, developers, dark dashboards

---

## 📐 **Typography**

### **Font Stack**

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
```

### **Scale**

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 48px | 700 | 1.2 |
| H2 | 36px | 700 | 1.3 |
| H3 | 24px | 600 | 1.4 |
| Body | 16px | 400 | 1.6 |
| Caption | 14px | 400 | 1.5 |
| Small | 12px | 400 | 1.4 |

---

## 📏 **Spacing System**

8pt Grid System:

```
4px  = 0.5 (gap-0.5)
8px  = 2   (gap-2)
16px = 4   (gap-4)
24px = 6   (gap-6)
32px = 8   (gap-8)
48px = 12  (gap-12)
64px = 16  (gap-16)
```

**Max Content Width**: `1200px`

---

## 🎭 **Component Patterns**

### **Button Hierarchy**

1. **Primary CTA** - Converto Blue, white text
2. **Secondary** - Border, transparent fill
3. **Tertiary** - Text link only

### **Card Pattern**

```tsx
<div className="bg-white dark:bg-surface rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
  {/* Content */}
</div>
```

### **Status Chips**

```tsx
<span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
  ✓ Active
</span>
```

---

## 🎬 **Motion Guidelines**

### **Timing**

- **Instant**: 150ms (hover, focus)
- **Standard**: 300ms (transitions)
- **Slow**: 500ms (page transitions)

### **Easing**

```css
ease-in-out /* default */
cubic-bezier(0.4, 0, 0.2, 1) /* custom smooth */
```

### **Reduced Motion**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ♿ **Accessibility**

### **WCAG AA Compliance**

- **Text contrast**: ≥ 4.5:1
- **Large text/CTA**: ≥ 3.0:1
- **Focus rings**: Visible on all interactive elements
- **Keyboard navigation**: Full support

### **Focus Ring**

```css
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #69B3FF;
}
```

---

## 🧩 **Component Library**

See individual `.md` files:

- `Hero.md` - Hero sections with gradient backgrounds
- `PricingGrid.md` - Pricing tables with psychological optimization
- `GamifyPanel.md` - Points, streaks, wallet
- `CommandPalette.md` - ⌘K quick actions
- `POSDashboard.md` - POS provider selector + sales charts
- `ContactForm.md` - Contact/demo booking forms
- `Footer.md` - Site footer

---

## 🔧 **Development**

### **Install Dependencies**

```bash
npm install next-themes framer-motion lucide-react
```

### **Import Patterns**

```tsx
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
```

### **Theme Usage**

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* Content */}
</div>
```

---

## 📊 **Performance**

- **First Paint**: < 1.5s
- **TTI**: < 3.5s
- **Lighthouse**: 90+ (all categories)
- **Bundle size**: < 200KB (gzipped)

---

## 🚀 **Live Demo**

Visit the interactive UI showcase:

```
http://localhost:3004/dev/ui-showcase
```

Features:
- ✅ All components interactive
- ✅ Theme switcher (Light/Dark/System)
- ✅ Language switcher (FI/EN/RU)
- ✅ Live code examples
- ✅ Copy-paste snippets

---

## 📝 **Usage Examples**

See component-specific `.md` files for detailed examples and code snippets.

---

## 📞 **Support**

Questions? Contact the design team:
**Email**: design@converto.fi
**Slack**: #converto-ui-dev

---

© 2025 Converto Solutions Oy · Developer Handbook v2.0
