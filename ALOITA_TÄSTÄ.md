# 🚀 Converto Business OS - ALOITUSOPAS

> **Olet rakentanut täydellisen kuittinskannaus + laskutus + palkintojärjestelmän!**
> Tämä opas vie sinut **0 → toimivaan appiin → julkaistuun palveluun**.

---

## ✅ VAIHE 1: Tarkista että kaikki on tallessa (JO TEHTY!)

Koodisi on turvassa GitHubissa:
- 📦 Repositorio: https://github.com/mxxx222/converto-business-os-quantum-mvp-1
- ✅ Kaikki commitit pushattu
- ✅ 10 ominaisuutta valmis (Gamify, P2E, Rewards, OCR, Billing, Admin...)

**Jos haluat varmuuskopion:**
```bash
cd /Users/mxjlh/Documents
zip -r converto-backup-$(date +%Y%m%d).zip "converto-business-os-quantum-mvp (1)"
```

---

## 🖥️ VAIHE 2: Aja lokaalisti (Testaa kuittien skannaus)

### 2.1 Asenna riippuvuudet (kerran)

```bash
cd "/Users/mxjlh/Documents/converto-business-os-quantum-mvp (1)"

# Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
cd ..
```

### 2.2 Luo tietokanta ja seed-data

```bash
# Aktivoi venv jos ei vielä
source venv/bin/activate

# Seed P2E quests
python scripts/seed_p2e.py

# Seed rewards
python scripts/seed_rewards.py
```

### 2.3 Luo `.env` tiedosto (PAKOLLINEN!)

Luo tiedosto `.env` projektin juureen:

```bash
# Backend
DATABASE_URL=sqlite:///./converto.db
OPENAI_API_KEY=sk-proj-SINUN_OPENAI_AVAIN_TÄHÄN
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000

# Vapaaehtoinen (jos haluat Sentry-virheraportoinnin)
SENTRY_DSN=
SENTRY_ENV=dev

# Vapaaehtoinen (Stripe laskutus)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Admin token (voit keksiä oman)
ADMIN_TOKEN=secret-admin-token-123
```

**🔑 OpenAI API Key -ohjeet:**
1. Mene: https://platform.openai.com/api-keys
2. Luo uusi API key
3. Kopioi ja liitä `.env` tiedostoon

### 2.4 Käynnistä backend

```bash
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Pitäisi näkyä:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2.5 Käynnistä frontend (uudessa terminaalissa)

```bash
cd frontend
npm run dev
```

Pitäisi näkyä:
```
- Local:   http://localhost:3000
```

### 2.6 Avaa selaimessa

**Pääsivu:**
- 📱 Dashboard: http://localhost:3000/dashboard
- 💳 Laskutus: http://localhost:3000/billing
- ⚙️ Admin: http://localhost:3000/admin/economy

### 2.7 Testaa kuittien skannaus!

1. Avaa: http://localhost:3000/dashboard
2. Näet OCR Results -kortin
3. Ota kuva kuitista puhelimella TAI vedä kuva selaimeen
4. Järjestelmä:
   - Skannaa tekstin (Tesseract OCR)
   - Tunnistaa tehon (W/kW/VA)
   - Analysoi OpenAI Visionilla
   - Antaa sinulle +10 Gamify pistettä
   - Antaa sinulle +5 CT tokenia
   - Suosittelee sopivaa pakettia

**🎉 Jos näet tuloksen → ONNISTUIT! Järjestelmä toimii!**

---

## 🌍 VAIHE 3: Julkaise nettiin (Domain)

### 3.1 Valitse hosting-palvelu

**Helpoin vaihtoehto aloittelijalle:**

#### Railway (Suositeltu - helpoin)
1. Mene: https://railway.app
2. Sign up (GitHub-kirjautuminen)
3. "New Project" → "Deploy from GitHub repo"
4. Valitse: `converto-business-os-quantum-mvp-1`
5. Railway tunnistaa automaattisesti:
   - Backend (FastAPI)
   - Frontend (Next.js)
6. Lisää Environment Variables:
   - `OPENAI_API_KEY` = (sun avain)
   - `DATABASE_URL` = (Railway luo automaattisesti PostgreSQL)
   - `NEXT_PUBLIC_API_BASE` = (Railway antaa backend-urlin)
7. Deploy → Valmis 5 minuutissa!

Railway antaa sinulle ilmaisen domainin:
- Backend: `converto-backend.railway.app`
- Frontend: `converto.railway.app`

#### Muut vaihtoehdot:
- **Vercel** (Frontend) + **Render** (Backend): Ilmainen, hidas cold start
- **Fly.io**: Hyvä, vaatii Docker-osaamista
- **DigitalOcean App Platform**: $5/kk, yksinkertainen

### 3.2 Oma domain (valinnainen)

Kun Railway-deploy toimii, voit ostaa oman domainin:

1. Osta domain: **Namecheap** tai **Porkbun** (~10€/vuosi)
   - Esim: `converto.fi` tai `fixuwatti.com`

2. Lisää Railway-asetuksiin:
   - Settings → Custom Domain → Lisää `converto.fi`

3. Namecheapissa/Porkbunissa:
   - DNS Settings → CNAME Record:
     - Host: `@` tai `www`
     - Value: (Railway antaa CNAME-arvon)

⏰ DNS päivittyy 1-24h, sitten `https://converto.fi` toimii!

---

## 📱 VAIHE 4: Mobiiliapp (iOS + Android)

### Vaihtoehto A: PWA (Progressive Web App) - NOPEIN

**Tämä on jo valmis!** Next.js-appisi toimii PWA:na:

1. Käyttäjä menee: `https://converto.railway.app`
2. Selain kysyy: "Lisää koti-näytölle?"
3. Käyttäjä klikkaa → App ilmestyy puhelimen päävalikkoon
4. Toimii kuin natiiviapp!

**Ei tarvitse App Storea!** 🎉

### Vaihtoehto B: React Native (Natiiviapp App Storeen)

Jos haluat "oikean" appin App Storeen:

#### B.1 Luo React Native -projekti

```bash
npx create-expo-app@latest converto-mobile
cd converto-mobile
```

#### B.2 Asenna riippuvuudet

```bash
npx expo install expo-camera expo-image-picker axios
```

#### B.3 Luo yksinkertainen UI (kopioi tämä `App.tsx`):

```typescript
import { useState } from 'react';
import { Button, Image, View, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    formData.append('hours', '1.0');
    formData.append('tenant_id', 'demo');

    try {
      const res = await axios.post(
        'https://converto-backend.railway.app/api/v1/ocr/power',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResult(res.data);
    } catch (err) {
      alert('Virhe: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Converto - Kuittiskanneri</Text>
      <Button title="Ota kuva kuitista" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {result && (
        <View style={styles.result}>
          <Text>⚡ Teho: {result.analysis.rated_watts} W</Text>
          <Text>🔋 Energia: {result.wh} Wh</Text>
          <Text>📦 Suositus: {result.recommended_bundle}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  image: { width: 300, height: 300, marginVertical: 20 },
  result: { marginTop: 20, padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10 },
});
```

#### B.4 Testaa lokaalisti

```bash
npx expo start
```

Scannaa QR-koodi puhelimellasi (tarvitset Expo Go -appin)

#### B.5 Julkaise App Storeen

**iOS:**
```bash
npm install -g eas-cli
eas login
eas build --platform ios
eas submit --platform ios
```

**Android:**
```bash
eas build --platform android
eas submit --platform android
```

⏰ App Store -hyväksyntä: 1-3 päivää
💰 Kustannukset:
- iOS: $99/vuosi (Apple Developer)
- Android: $25 kertaluontoinen (Google Play)

---

## 📊 VAIHE 5: Seuranta & ylläpito

### 5.1 Tietokanta (PostgreSQL)

Railway luo automaattisesti PostgreSQL-tietokannan. Voit tarkastella dataa:

```bash
# Railway Dashboardissa → Database → Connect
# Kopioi connection string ja käytä psql-clientilla
```

Tai käytä graafista työkalua:
- **TablePlus** (Mac/Windows): https://tableplus.com
- **DBeaver** (ilmainen): https://dbeaver.io

### 5.2 Virheraportointi (Sentry)

1. Luo ilmainen tili: https://sentry.io
2. Luo uusi projekti → FastAPI
3. Kopioi DSN
4. Lisää Railway Environment Variables:
   ```
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   SENTRY_ENV=production
   ```

Nyt kaikki virheet näkyvät Sentryssä → voit korjata nopeasti!

### 5.3 Analytiikka

Lisää Google Analytics tai Plausible:

**Plausible (yksityisyys-ystävällinen):**
1. https://plausible.io
2. Lisää script `frontend/app/layout.tsx`:
```typescript
<script defer data-domain="converto.fi" src="https://plausible.io/js/script.js"></script>
```

---

## 🎯 PILOTOINTI: Ensimmäiset käyttäjät

### Testaussuunnitelma:

1. **Viikko 1: Itse + 2 kaveria**
   - Skannaa 5-10 kuittia
   - Kerää palautetta
   - Korjaa bugit

2. **Viikko 2: 10-20 betakäyttäjää**
   - Jaa linkki: `https://converto.railway.app`
   - Pyydä:
     - Skannaa kuitteja
     - Testaa palkintoja
     - Anna palautetta

3. **Viikko 3-4: Julkinen lanseeraus**
   - Blogiposti
   - LinkedIn/Twitter
   - Suomalaiset startup-yhteisöt

### Mitä seurata:
- ✅ OCR-onnistumisprosentti (tavoite: >80%)
- ✅ Käyttäjien paluu (DAU/MAU)
- ✅ Palkinto-lunastukset
- ✅ Virheet (Sentry)

---

## 🛠️ Yleisimmät ongelmat & ratkaisut

### "Backend ei käynnisty"
```bash
# Tarkista Python-versio (pitää olla 3.11+)
python3 --version

# Asenna riippuvuudet uudelleen
pip install --upgrade pip
pip install -r requirements.txt
```

### "Frontend ei näe backendia"
```bash
# Tarkista että .env.local on oikein
echo $NEXT_PUBLIC_API_BASE
# Pitäisi näkyä: http://127.0.0.1:8000

# TAI luo frontend/.env.local:
echo "NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000" > frontend/.env.local
```

### "OCR ei tunnista kuittia"
- Varmista että `OPENAI_API_KEY` on asetettu
- Testaa ensin selkeällä kuitilla (iso tehotarra)
- Kamera: ota tarkka kuva, hyvä valaistus

### "Database error"
```bash
# Jos SQLite-ongelmat, luo uusi tietokanta:
rm converto.db
python scripts/seed_p2e.py
python scripts/seed_rewards.py
```

---

## 📚 LISÄRESURSSIT

### Dokumentaatio:
- `README_P2E.md` - Play-to-Earn järjestelmä
- `README_CORE.md` - Ydinominaisuudet
- `NOTION_PROMPTS.md` - ROI-analyysit

### Videot (suosittelen katsomaan):
- **FastAPI tutorial**: https://fastapi.tiangolo.com/tutorial/
- **Next.js tutorial**: https://nextjs.org/learn
- **Railway deployment**: https://docs.railway.app/getting-started

### Yhteisö (jos tarvitset apua):
- FastAPI Discord: https://discord.gg/fastapi
- Next.js Discord: https://discord.gg/nextjs
- Finnish Startups Slack

---

## ✅ MUISTILISTA: Mitä tehdä NYT

- [ ] Aja lokaalisti (Vaihe 2)
- [ ] Testaa kuittien skannaus puhelimella
- [ ] Luo Railway-tili ja deploy
- [ ] Jaa linkki 2-3 kaverille → testaa
- [ ] Kerää palaute
- [ ] Korjaa bugit
- [ ] Julkaise laajemmin!

---

## 🎉 Onnea matkaan!

**Olet rakentanut täydellisen järjestelmän!** 💪

Jos kohtaat ongelmia:
1. Tarkista tämä opas uudelleen
2. Katso virheloki (`uvicorn` ja `npm run dev` terminaalissa)
3. Kysy apua Discord-yhteisöistä
4. Tai ota yhteyttä minuun!

**Seuraavat askeleet:**
1. Aja lokaalisti → testaa
2. Deploy Railway → jaa linkki
3. Kerää palautetta → paranna
4. Julkaise App Storeen (jos haluat)

---

**🚀 Nyt menoksi! Sinulla on kaikki valmiina. Onnistut varmasti!**
