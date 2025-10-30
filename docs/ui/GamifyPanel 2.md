# Gamify Panel Component

## Overview

The Gamify Panel displays user points, rewards, and wallet balance with Fixu™ neon green accents.

## Design Specs

- **Background**: Gradient `from-emerald-50 to-teal-50` (light) / `from-emerald-900/20 to-teal-900/20` (dark)
- **Points color**: `#39FF14` (Fixu™ Green)
- **Border**: `emerald-200` (light) / `emerald-700` (dark)
- **Animation**: Confetti on milestone (100p, 500p, 1000p)

## Usage

```tsx
<div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold flex items-center gap-2">
      <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      Converto Wallet
    </h3>
    <span className="text-2xl font-bold" style={{ color: "#39FF14" }}>
      335p
    </span>
  </div>
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
    = 3.35 € hyvitystä seuraavaan laskuun
  </p>
  <button
    className="w-full py-3 rounded-xl font-bold transition-all active:scale-95"
    style={{ backgroundColor: "#39FF14", color: "#000" }}
  >
    Lunasta pisteet
  </button>
</div>
```

## Point Triggers

| Action | Points | Euro Value |
|--------|--------|------------|
| OCR scan | +5p | 0.05 € |
| VAT report | +10p | 0.10 € |
| Invoice paid | +25p | 0.25 € |
| Zettle import | +50p | 0.50 € |
| Notion sync | +75p | 0.75 € |
| Upgrade to Pro | +100p | 1.00 € |

## Confetti Animation

```tsx
import confetti from "canvas-confetti";

if (points % 100 === 0 && points > 0) {
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.8 }
  });
}
```

## Accessibility

- ✅ High contrast neon green on dark backgrounds
- ✅ Sound effects optional (user preference)
- ✅ Animation respects `prefers-reduced-motion`
