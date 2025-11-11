# 🎨 Converto™ Branding Guidelines

Official terminology and language for Converto Business OS.

---

## 📝 Terminology Changes

### AI → Automaatioteknologia™

**Why?** Finnish market (especially SME sector) prefers concrete, trustworthy terms over "AI hype".

| ❌ Old (AI-focused) | ✅ New (Automation-focused) |
|---------------------|----------------------------|
| AI | Automaatioteknologia™ |
| AI-avustaja | Automaattinen liiketoiminta-avustaja |
| AI-analyysi | Automaattinen analyysi |
| AI Insights | Automaattiset oivallukset |
| AI-kuittiskannaus | Automaattinen kuitintunnistus |
| AI-luokitin | Älykäs luokitin |
| AI-lakiagentti | Lakisääntelyn automaatio |
| AI Engine | Automaatiomoottori |
| AI Chat | Keskusteleva apuri |

---

## 🎯 StoryBrand Framework

### Hero Copy (Root & Dashboard)

**Headline:** "Yksi paikka yrityksesi rutiineille."

**Subheadline:** "Kuitit, ALV, raportit ja muistutukset – automaattisesti."

**CTA Buttons:**
- Primary: "Aloita"
- Secondary: "Kokeile kuitinskannausta"

### Value Propositions (3 Points)

1. **Säästät aikaa**
   "Kuitit → tiedot talteen → ALV oikein. Ei naputtelua."

2. **Näet olennaisen**
   "Selkeä viikkokooste ilman taulukkoviidakkoa."

3. **Toimit varmemmin**
   "Muistutukset ja ehdotukset oikeaan aikaan."

---

## 🎨 Visual Identity

### Colors

```css
Primary:     #1f3bff  (Brand Blue)
Secondary:   #16b1ff  (Sky Blue)
Accent:      #8b5cf6  (Purple)
Success:     #10b981  (Green)
Background:  #0b1120  (Dark Navy)
Text:        #ffffff  (White)
Muted:       rgba(255,255,255,0.6)
```

### Typography

**Font Family:** Inter, SF Pro Display, system-ui

**Weights:**
- Regular: 400
- Semibold: 600
- Bold: 700

**Sizes:**
- Hero: 48px (3xl)
- H1: 32px (2xl)
- H2: 24px (xl)
- Body: 16px (base)
- Small: 14px (sm)
- Caption: 12px (xs)

---

## 📱 UI Components

### Glass Morphism
```tsx
className="glass rounded-2xl p-6"
// → backdrop-blur-xl bg-white/10 border border-white/15 shadow-xl
```

### Hero Background
```tsx
className="bg-hero"
// → Multi-layer radial + linear gradients
```

### Premium Card
```tsx
className="premium-card"
// → hover:scale-[1.02] hover:shadow-2xl transition
```

### Gradient Text
```tsx
className="text-gradient"
// → bg-clip-text text-transparent gradient
```

---

## ✍️ Writing Style

### Tone of Voice
- **Clear** - No jargon
- **Friendly** - Conversational Finnish
- **Professional** - Business-appropriate
- **Helpful** - Solution-oriented

### Example Copy

**❌ Technical:**
"AI-powered machine learning algorithm processes OCR data using GPT-4 Vision API."

**✅ Clear:**
"Järjestelmä lukee kuitit ja tunnistaa tiedot automaattisesti."

**❌ Too casual:**
"AI hoitaa homman puolesta!"

**✅ Professional:**
"Automaatio hoitaa rutiinit – sinä keskityt liiketoimintaan."

---

## 🔤 Product Names

### Official Names

**Full:** Converto™ Business OS
**Short:** Converto
**Tagline:** "Automaatioteknologia suomalaiselle yritykselle"

### Module Names

| Module | Finnish Name |
|--------|--------------|
| OCR Core | Automaattinen kuitintunnistus |
| VAT Calculator | ALV-automaatti |
| Billing | Laskutusautomaatio |
| Legal | Lakisääntelyn seuranta |
| Gamify | Palkitseva toiminta |
| Reminders | Älykkäät muistutukset |
| Reports | Automaattiset raportit |

---

## 📊 Marketing Messages

### Feature Benefits (not features)

**❌ Feature-focused:**
"Notion API integration with bidirectional sync"

**✅ Benefit-focused:**
"Kuitit talteen Notioniin automaattisesti – säästät 2h kuussa"

### ROI Communication

**Always show concrete value:**

"Notion Sync säästää 2h/kk → arvo 60€ → hinta 9€ → **ROI 600%**"

"Automaatioteknologia™ teki puolestasi 3h työtä tällä viikolla"

---

## 🎤 Sales Pitches

### Elevator Pitch (30 seconds)

"Converto on automaatiopalvelu suomalaisille yrityksille. Se hoitaa kuitit, ALV:n ja raportit automaattisesti. Säästät 10 tuntia kuussa ja pidät kirjanpidon ajan tasalla ilman vaivaa."

### Value Proposition (60 seconds)

"Jokainen suomalainen yrittäjä viettää keskimäärin 10-15 tuntia kuussa kuittien, ALV:n ja raporttien kanssa. Converto automatisoi koko prosessin:

1. Skannaa kuitit – tunnistaa tiedot
2. Laskee ALV:n oikean veroprosentin mukaan
3. Lähettää muistutukset määräpäivistä
4. Luo raportit automaattisesti

Säästät vähintään 10 tuntia kuussa. Jos arvostat aikaasi 30€/tunti, se on 300€/kk. Converto maksaa 19-79€/kk riippuen pakettista. ROI on 400-1500%."

---

## 📞 Customer Communication

### Support Emails
- Greeting: "Hei!"
- Closing: "Terveisin, Converto-tiimi"
- Tone: Ystävällinen, auttavainen, nopea

### Error Messages
**❌ Technical:**
"Error 500: Internal server error in OCR module"

**✅ User-friendly:**
"Hetkellinen häiriö kuittiskannauksessa. Yritä uudelleen hetken kuluttua."

### Success Messages
**✅ Encouraging:**
"Kuitti tallennettu! Automaatioteknologia tunnisti ALV:n oikein."

---

## 🚀 Launch Messaging

### Pre-Launch Teaser
"Tulossa: Automaatioteknologia, joka hoitaa yrityksesi rutiinit puolestasi."

### Launch Announcement
"Converto Business OS julkaistu! Skannaa kuitit, laske ALV ja pidä kirjanpito kunnossa – automaattisesti."

### Post-Launch Follow-up
"Kiitos, että liityit Convertoon! Oletko jo kokeillut kuittiskannausta? Säästät 2 minuuttia per kuitti."

---

## 🎨 Design Principles

1. **Clarity over cleverness** - Selkeys ensin
2. **Function over flash** - Toiminnallisuus edellä
3. **Speed over complexity** - Nopeus tärkeää
4. **Trust through transparency** - Luottamus läpinäkyvyydellä

---

## ✅ Brand Checklist

Before any public communication, verify:

- [ ] No "AI" terminology (use "Automaatioteknologia™")
- [ ] Benefits clearly stated (not just features)
- [ ] ROI quantified when possible
- [ ] Finnish language correct (no machine translation errors)
- [ ] Professional tone (not too casual, not too formal)
- [ ] Call-to-action clear and specific
- [ ] Contact info present (support@converto.fi)

---

**✅ Follow these guidelines for consistent, trustworthy brand communication!**
