# 🚀 Vercel Deploy - Helppo Opas

## ⚡ Nopein tapa (1 komento)

### Frontend-hakemistosta:
```bash
cd frontend
npm run deploy
```

### Juurihakemistosta:
```bash
./scripts/quick-vercel-deploy.sh
```

---

## 🔧 Automaattinen korjaus ja deploy

Tämä tarkistaa kaiken ja deployaa automaattisesti:

```bash
./scripts/vercel-fix-and-deploy.sh
```

**Mitä tämä tekee:**
1. ✅ Tarkistaa git status
2. ✅ Commitoida ja pushaa muutokset (jos pyydetään)
3. ✅ Tarkistaa että Vercel CLI on asennettuna
4. ✅ Testaa build paikallisesti
5. ✅ Deployaa Verceliin
6. ✅ Tarkistaa että deployment onnistui

---

## 📋 Kaikki tavat

### 1. NPM Script (Helpoin)
```bash
cd frontend
npm run deploy          # Quick deploy
npm run deploy:check    # Build + deploy
```

### 2. Bash Script
```bash
./scripts/quick-vercel-deploy.sh           # Quick
./scripts/vercel-fix-and-deploy.sh         # Full auto-fix
```

### 3. Vercel CLI Suoraan
```bash
cd frontend
npx vercel --prod
```

### 4. GitHub Automaattinen (Suositus)
Vercel deployaa automaattisesti kun pushaat `main`-branchiin:
```bash
git add .
git commit -m "fix: your changes"
git push origin main
# Vercel deployaa automaattisesti 1-5 minuutissa
```

---

## 🔑 VERCEL_TOKEN Asetus (Vaihtoehtoinen)

Jos haluat deployata ilman interaktiota:

```bash
export VERCEL_TOKEN=your_token_here
npm run deploy
```

**Token haku:**
1. Mene: https://vercel.com/account/tokens
2. Klikkaa "Create Token"
3. Kopioi token

---

## ✅ Checklist

- [ ] Muutokset commitoitu ja pushattu (jos käytät GitHub-automaatiota)
- [ ] Build toimii paikallisesti (`npm run build`)
- [ ] Vercel CLI asennettuna tai VERCEL_TOKEN asetettu

---

## 🐛 Ongelmat

### "Vercel CLI not found"
```bash
npm install -g vercel
```

### "Build failed"
```bash
cd frontend
npm install
npm run build
```

### "Deployment not updating"
1. Tarkista: https://vercel.com/dashboard
2. Odota 1-5 minuuttia (Vercel cache)
3. Kokeile manuaalista redeployausta

---

## 📊 Tarkista Deployment

### Tarkista onko uusi versio käytössä:
```bash
# Tarkista bundle-hash
curl -s https://converto.fi | grep -o 'app/page-[^"]*\.js' | head -1
```

### Tarkista Vercel Dashboard:
- Mene: https://vercel.com/dashboard
- Valitse projekti
- Tarkista deployment-lokit

---

## 🎯 Quick Reference

```bash
# Nopein tapa
cd frontend && npm run deploy

# Automaattinen korjaus
./scripts/vercel-fix-and-deploy.sh

# GitHub automaattinen (suositus)
git push origin main  # Vercel deployaa automaattisesti
```

---

**💡 Vinkki:** Jos käytät GitHub-automaatiota, riittää että pushaat muutokset. Vercel deployaa automaattisesti!
