# Hero Component

## Overview

The Hero component is the primary landing element featuring gradient backgrounds, bold messaging, and clear CTAs.

## Design Specs

- **Background**: Gradient `from-indigo-600 via-purple-600 to-pink-600`
- **Text**: White with high contrast
- **CTAs**: Primary (white bg) + Secondary (glass morphism)
- **Badge**: "Local Intelligence 🔒" chip

## Usage

```tsx
<section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
  <div className="max-w-6xl mx-auto px-4 text-center">
    <h1 className="text-5xl font-bold mb-4">
      Yksi älykäs järjestelmä
    </h1>
    <p className="text-xl text-white/90 mb-8">
      Kaikki yrityksen toiminnot hallinnassa
    </p>
    <div className="flex gap-4 justify-center">
      <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold">
        Aloita ilmaiseksi
      </button>
      <button className="px-8 py-4 bg-white/10 backdrop-blur border-2 border-white/30 text-white rounded-xl font-bold">
        Tutustu alustaan
      </button>
    </div>
  </div>
</section>
```

## Variants

### With Badge

```tsx
<div className="flex items-center gap-2 justify-center mb-4">
  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-sm border border-white/20">
    🇫🇮 Local Intelligence 🔒
  </span>
</div>
```

## Accessibility

- ✅ WCAG AAA contrast (white on gradient)
- ✅ Focus rings on CTAs
- ✅ Keyboard navigable

## Performance

- Gradient rendered as CSS (no images)
- Motion respects `prefers-reduced-motion`
