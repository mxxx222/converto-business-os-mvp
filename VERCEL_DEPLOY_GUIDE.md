# 🚀 Vercel Deploy - Helppo Opas

## ⚡ Nopein tapa (1 komento)

```bash
./scripts/quick-vercel-deploy.sh
```

Tämä deployaa suoraan Verceliin ilman tarkistuksia.

---

## 🔧 Automaattinen korjaus ja deploy

```bash
./scripts/vercel-fix-and-deploy.sh
```

Tämä skripti:
1. ✅ Tarkistaa git status
2. ✅ Commitoida ja pushaa muutokset (jos pyydetään)
3. ✅ Tarkistaa että Vercel CLI on asennettuna
4. ✅ Testaa build paikallisesti
5. ✅ Deployaa Verceliin
6. ✅ Tarkistaa että deployment onnistui

---

## 📋 Vaihtoehdot

### Vaihtoehto 1: Vercel CLI (Suositus)

```bash
cd frontend
npx vercel --prod
```

Tai jos VERCEL_TOKEN on asetettu:
```bash
cd frontend
VERCEL_TOKEN=your_token vercel --prod --yes
```

### Vaihtoehto 2: GitHub Automaattinen Deploy

Vercel deployaa automaattisesti kun pushaat `main`-branchiin:

```bash
git add .
git commit -m "fix: your changes"
git push origin main
```

Vercel deployaa automaattisesti 1-5 minuutissa.

### Vaihtoehto 3: Vercel Dashboard

1. Mene: https://vercel.com/dashboard
2. Valitse projekti
3. Klikkaa "Redeploy" tai "Deploy" -nappia

---

## 🔑 VERCEL_TOKEN Asetus

### Yksittäinen deploy:
```bash
export VERCEL_TOKEN=your_token_here
./scripts/vercel-fix-and-deploy.sh
```

### Pysyvä asetus (.env):
```bash
echo "VERCEL_TOKEN=your_token_here" >> .env
```

### Vercel Token haku:
1. Mene: https://vercel.com/account/tokens
2. Klikkaa "Create Token"
3. Kopioi token

---

## 🐛 Ongelmat ja ratkaisut

### "Vercel CLI not found"
```bash
npm install -g vercel
```

### "Build failed"
```bash
cd frontend
npm install
npm run build
# Tarkista virheet
```

### "Deployment not updating"
1. Tarkista Vercel-dashboard: https://vercel.com/dashboard
2. Tarkista build-lokit
3. Kokeile manuaalista redeployausta

### "Changes not showing"
- Vercel käyttää cachea. Odota 1-5 minuuttia
- Tai käynnistä uusi deployment manuaalisesti

---

## 📊 Deployment Status Tarkistus

### Tarkista bundle-hash:
```bash
curl -s https://converto.fi | grep -o 'app/page-[^"]*\.js' | head -1
```

### Tarkista deployment ID:
Avaa selaimen Developer Tools → Network → Etsi `page-*.js` → Tarkista `?dpl=` parametri

---

## ✅ Checklist ennen deployausta

- [ ] Muutokset commitoitu ja pushattu
- [ ] Build toimii paikallisesti (`npm run build`)
- [ ] Ei linter-virheitä
- [ ] Testit menevät läpi (jos saatavilla)
- [ ] Vercel CLI asennettuna tai VERCEL_TOKEN asetettu

---

## 🎯 Quick Commands

```bash
# Deployaa nopeasti
./scripts/quick-vercel-deploy.sh

# Korjaa ja deployaa
./scripts/vercel-fix-and-deploy.sh

# Tarkista git status
git status

# Pushaa muutokset
git add . && git commit -m "fix: ..." && git push origin main

# Testaa build
cd frontend && npm run build
```

---

## 📞 Tuki

Jos ongelmia:
1. Tarkista Vercel-dashboard: https://vercel.com/dashboard
2. Tarkista build-lokit Vercelissä
3. Tarkista että GitHub-webhook on konfiguroitu oikein
