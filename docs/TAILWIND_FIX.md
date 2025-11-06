# 🎨 Tailwind CSS Korjausohje

## Ongelma
Dashboard näyttää vain valkoisen taustan - Tailwind CSS ei toimi.

## Ratkaisu

### 1. **Tailwind Config** ✅
```bash
frontend/tailwind.config.js
```
- Sisältää `darkMode: ['class']`
- Sisältää `content` paths (app, components, pages)
- Sisältää plugins: forms, typography, animate

### 2. **PostCSS Config** ✅
```bash
frontend/postcss.config.js
```
- Sisältää `tailwindcss` ja `autoprefixer` plugins

### 3. **Next.js Config** ✅
```bash
frontend/next.config.js
```
- **MUUTOS**: `enrolledStaticExport` oletusarvo muutettu
- Ennen: `process.env.NEXT_PUBLIC_STATIC_EXPORT !== 'false'` → default true
- Nyt: `process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'` → default false (SSR)

### 4. **Globals CSS** ✅
```bash
frontend/app/globals.css
```
- Sisältää `@tailwind` direktiivit ylhäällä
- Importataan `layout.tsx`:ssä

## Käynnistäminen

### Dashboard (SSR - Tailwind toimii):
```bash
cd frontend
NEXT_PUBLIC_STATIC_EXPORT=false npm run dev
# tai ilman env-var (default nyt SSR)
npm run dev
```

### Marketing (Static Export):
```bash
cd frontend
NEXT_PUBLIC_STATIC_EXPORT=true npm run build
```

## Tarkistus

1. **Tailwind luokat HTML:ssa:**
   ```bash
   curl -s http://localhost:3000/dashboard | grep 'class="bg-gray'
   ```

2. **Tailwind CSS generoitu:**
   ```bash
   curl -s http://localhost:3000/_next/static/css/app/layout.css | grep '\.bg-gray'
   ```

3. **Browser Console:**
   - F12 → Console: ei virheitä?
   -没问题 Network → layout.css: 200 OK?

## Ongelmatilanteet

### CSS ei lataudu:
- Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- Clear browser cache
- Tarkista että Next.js on SSR-modessa (ei static export)

### Tailwind luokat eivät toimi:
- Tarkista `tailwind.config.js` `content` paths
- Varmista että tiedostot ovat oikeissa kansioissa
- Restart Next.js dev server

### Valkoinen tausta:
- Tarkista että `globals.css` importataan `layout.tsx`:ssä
- Varmista että PostCSS processoi CSS:n
- Check browser DevTools → Elements → Styles (applied?)

## Status

✅ Tailwind config ok
✅ PostCSS config ok
✅ Next.js SSR mode ok
✅ CSS generoituu

**Dashboard pitäisi nyt näyttää oikein Tailwind-tyyleillä!**


