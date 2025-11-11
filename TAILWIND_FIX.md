# TAILWIND CSS ONGELMA JA RATKAISU

## Ongelma:
- Tailwind v4 + Next.js 15 yhteensopivuusongelma
- CSS ei generoidu ollenkaan
- Kaikki luokat (bg-gradient, rounded, shadow jne.) EI RENDAA

## Ratkaisu (TOIMIVA):

1. **Käytä Tailwind v3.4.1** (vakaa Next.js 15 kanssa)
2. **PostCSS v8.4.x**
3. **Varmista globals.css ladataan** layout.tsx:ssä

## Quick Fix:

```bash
cd frontend
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.18
npx tailwindcss init -p
docker-compose build frontend
docker-compose up -d frontend
```

## Tai käytä inline-styles:

Jos Tailwind ei toimi, vaihda komponentit inline-styles:ään:
```tsx
<div style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '24px',
  borderRadius: '16px'
}}>
```

Tämä on 100% luotettava fallback.
