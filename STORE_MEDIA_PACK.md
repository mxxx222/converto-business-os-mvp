# 🎨 Store Media Pack - Converto Business OS

Complete visual guide for App Store and Play Store screenshots, icons, and marketing materials.

---

## 🎨 Brand Guidelines

### Color Palette
```
Primary:     #0b1020  (Dark Navy - Background)
Accent:      #6366f1  (Indigo - Primary CTA)
Success:     #10b981  (Green - Positive actions)
Highlight:   #39FF14  (Neon Green - Special highlights)
Text:        #ffffff  (White - Primary text)
Secondary:   #94a3b8  (Slate - Secondary text)
```

### Typography
- **Font Family:** Inter / SF Pro Display
- **Weights:** 400 (Regular), 600 (Semibold), 700 (Bold)
- **Headings:** 32-48px, tracking-wide
- **Body:** 16-18px, line-height 1.6
- **Captions:** 12-14px

### Layout Ratios
- **iOS 6.7" (iPhone 14 Pro Max):** 1284 × 2778 px
- **iOS 5.5" (iPhone 8 Plus):** 1242 × 2208 px
- **Android (Generic):** 1080 × 1920 px
- **Feature Graphic (Android):** 1024 × 500 px

---

## 📸 Screenshot Concepts (6 Required)

### Screenshot 1: OCR Scanning
**Headline:** "Älykkäin kuittiskannaus Suomessa"
**Subtext:** "Skannaa, tallenna ja valmis – ALV laskettu automaattisesti."

**Visual Elements:**
- OCR dropzone interface (center)
- Sample receipt image with overlay
- AI result card showing extracted data
- Green checkmarks for validated fields
- Upload progress indicator

**Key Message:** Speed and accuracy of receipt scanning

---

### Screenshot 2: VAT Calculator
**Headline:** "ALV ja raportointi automaattisesti"
**Subtext:** "Vero.fi-tietojen mukainen automaattinen laskenta."

**Visual Elements:**
- VAT rate cards (24%, 14%, 10%)
- Bar chart showing VAT breakdown
- Monthly summary widget
- Green verification badges
- Export buttons (PDF/CSV)

**Key Message:** Compliance and automation

---

### Screenshot 3: Gamification
**Headline:** "Gamify – tee säästämisestä peli"
**Subtext:** "Palkitse itseäsi säästöistä ja rutiineista."

**Visual Elements:**
- Points progress bar
- Achievement badges
- Streak counter (🔥 7 päivää)
- Weekly activity chart
- Reward catalog preview

**Key Message:** Engagement and motivation

---

### Screenshot 4: Billing
**Headline:** "Laskutus ja maksut sekunnissa"
**Subtext:** "Turvallinen maksu ja lasku yhdellä napilla."

**Visual Elements:**
- Subscription plan cards (Lite, Pro, Insights)
- Stripe payment badge
- Invoice history table
- Active subscription indicator
- Secure payment icons

**Key Message:** Trust and simplicity

---

### Screenshot 5: Legal Compliance
**Headline:** "Lakimuutokset automaattisesti päivitettynä"
**Subtext:** "Pysy aina lain tasalla – AI tarkistaa säännökset puolestasi."

**Visual Elements:**
- Legal rules cards with Finlex logo
- Compliance status indicator
- Recent updates timeline
- Risk assessment widget
- Sync button

**Key Message:** Peace of mind and compliance

---

### Screenshot 6: Dashboard Overview
**Headline:** "Kaikki yrityksen hallinta samassa"
**Subtext:** "Converto Business OS yhdistää kaiken yhdelle näytölle."

**Visual Elements:**
- KPI cards (Revenue, Expenses, ROI)
- Mini charts and graphs
- Quick action buttons
- Notification badges
- Gradient background (dark blue to indigo)

**Key Message:** Comprehensive business management

---

## 🖼️ Design Templates

### Figma Structure
```
/marketing/figma/StoreScreens/
├── Screen1_OCR.fig
├── Screen2_VAT.fig
├── Screen3_Gamify.fig
├── Screen4_Billing.fig
├── Screen5_Legal.fig
├── Screen6_Dashboard.fig
└── AppIcon_1024.fig
```

### Layer Hierarchy (Each Screenshot)
1. **Background** - Gradient (dark blue → indigo)
2. **Device Frame** - iPhone 14 Pro or Pixel 7 mockup
3. **App Screenshot** - Actual UI capture
4. **Headline** - Large, bold, white text (top third)
5. **Subtext** - Smaller, slate text (below headline)
6. **Logo** - Top-left corner (optional)
7. **Accent Elements** - Glow effects, arrows, highlights

---

## 🎯 Canva Quick Setup

### Step-by-Step
1. **Create Custom Size:** 1080 × 1920 px
2. **Choose Template:** "Phone Mockup Gradient"
3. **Add Background:** Dark gradient (navy → indigo)
4. **Insert Device Frame:** iPhone or Android mockup
5. **Add Screenshot:** Capture from Chrome DevTools
   - Press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows)
   - Type "Capture full size screenshot"
   - Upload to Canva
6. **Add Text:**
   - Headline: 48px, Bold, White, Centered
   - Subtext: 24px, Regular, Slate, Centered
7. **Add Logo:** Top-left, 80×80 px
8. **Export:** PNG, High quality

### Canva Template Link (Create Your Own)
- Search: "App Store Screenshot Template"
- Filter: 1080 × 1920 px
- Customize with Converto brand colors

---

## 📱 App Icon Design

### Requirements
- **Size:** 1024 × 1024 px
- **Format:** PNG (no transparency for iOS)
- **Corner Radius:** iOS applies automatically
- **Content:** No text, clean symbol

### Design Concept
```
Background: #0b1020 (Dark Navy)
Symbol: ⚡ "C" in Neon Green (#39FF14)
Style: Minimalist, geometric
Effect: Subtle glow around symbol
```

### Export Sizes
- **iOS:** 1024×1024 (App Store Connect)
- **Android:** 512×512 (Play Console)
- **PWA:** 192×192, 512×512 (manifest.json)

### Icon Variations
```
/frontend/public/icons/
├── icon-72.png
├── icon-96.png
├── icon-128.png
├── icon-144.png
├── icon-152.png
├── icon-192.png
├── icon-384.png
├── icon-512.png
├── icon-1024.png (iOS)
└── maskable-512.png (Android adaptive)
```

---

## 📝 Store Listing Copy

### App Name
**Primary:** Converto Business OS
**Short:** Converto

### Subtitle (iOS, 30 chars)
```
Älykäs kuittiskannaus ja automaatio
```

### Short Description (Android, 80 chars)
```
Älykkäin suomalainen kuitti-, ALV- ja yritysautomaatiotyökalu.
```

### Keywords (iOS, 100 chars)
```
kuittiskannaus,yritys,ALV,tekoäly,kirjanpito,automaatio,laskutus,suomi,business
```

### Full Description (4000 chars max)
```
Tuo tekoäly yrityksesi arkeen. Converto Business OS helpottaa kirjanpitoa,
laskutusta ja päätöksentekoa automaation voimalla.

✨ OMINAISUUDET

🧾 Älykäs kuittiskannaus
Skannaa kuitit kameralla tai lataa kuvia. Tekoäly tunnistaa automaattisesti
kauppiaan, summan, ALV:n ja tuoterivit.

🧮 Automaattinen ALV-laskenta
Suomen verosäännöt sisäänrakennettuna. Saat oikeat ALV-prosentit ja
yhteenvedot automaattisesti.

📊 Reaaliaikaiset analytiikkat
Seuraa myyntiä, kuluja, ROI:ta ja kassavirtaa reaaliajassa. Exportoi
raportit PDF/CSV-muodossa.

⚖️ Lakisääteinen compliance
Integroitu Finlex-tietokanta pitää sinut ajan tasalla Suomen
liiketoimintasäädöksistä.

💳 Laskutus ja maksut
Stripe-integraatio mahdollistaa nopeat maksut ja tilausten hallinnan.

🎮 Gamification
Ansaitse pisteitä ja palkintoja hyvistä liiketoimintatavoista.
Streak-bonukset ja tiimikampanjat.

🚀 MIKSI CONVERTO?

• Säästä 10+ tuntia kuukaudessa hallinnollisissa tehtävissä
• Vähennä veroilmoitusvirheitä 95%
• Saat välittömät ROI-näkemykset
• Pysy ajan tasalla Suomen säädöksistä
• GDPR-turvallinen ja EU-palvelimet

🇫🇮 TEHTY SUOMELLE

Rakennettu erityisesti suomalaisille yrityksille:
• Suomenkielinen käyttöliittymä
• Suomen verosäännöt sisäänrakennettuna
• Finlex-integraatio
• Paikallinen tuki

💼 HINNOITTELU

• Lite: 29€/kk - Kuittiskannaus ja perusraportit
• Pro: 49€/kk - AI-analytiikka ja ennusteet
• Insights: 99€/kk - Täysi analytiikka ja PDF-raportit

📞 TUKI

Sähköposti: support@converto.fi
Verkko: https://converto.fi
Chat: Sovelluksen sisäinen tuki

🔒 TIETOSUOJA

Kaikki tiedot tallennetaan turvallisesti EU-alueelle. GDPR-yhteensopiva.
Lue lisää: https://converto.fi/privacy
```

---

## 🎬 Promo Video Script (Optional)

### Duration: 30 seconds

**Scene 1 (0-5s):** Problem
- Cluttered desk with receipts
- Text: "Kuitit ja laskut sekaisin?"

**Scene 2 (5-10s):** Solution Intro
- Phone scanning receipt
- Text: "Converto Business OS"

**Scene 3 (10-15s):** Features
- Quick cuts: OCR → VAT → Dashboard
- Text: "Skannaa. Laske. Hallitse."

**Scene 4 (15-25s):** Benefits
- Happy user checking phone
- Text: "Säästä 10h/kk. Vähennä virheitä 95%."

**Scene 5 (25-30s):** CTA
- App icon + download button
- Text: "Lataa ilmaiseksi. App Store & Google Play."

---

## 📦 Export Checklist

### iOS App Store
- [ ] App Icon: 1024×1024 PNG (no transparency)
- [ ] Screenshots 6.7": 1284×2778 (3-10 images)
- [ ] Screenshots 5.5": 1242×2208 (3-10 images)
- [ ] App Preview Video: 1920×1080 MP4 (optional)

### Google Play Store
- [ ] App Icon: 512×512 PNG (32-bit)
- [ ] Feature Graphic: 1024×500 PNG/JPG
- [ ] Phone Screenshots: 1080×1920 (3-8 images)
- [ ] 7" Tablet: 1200×1920 (optional)
- [ ] 10" Tablet: 1800×2560 (optional)
- [ ] Promo Video: YouTube URL (optional)

### File Naming Convention
```
converto_icon_1024.png
converto_feature_1024x500.png
converto_screen1_ocr_1080x1920.png
converto_screen2_vat_1080x1920.png
converto_screen3_gamify_1080x1920.png
converto_screen4_billing_1080x1920.png
converto_screen5_legal_1080x1920.png
converto_screen6_dashboard_1080x1920.png
converto_promo_video.mp4
```

---

## 🎨 Screenshot Capture Guide

### Using Chrome DevTools
1. Open https://app.converto.fi
2. Press `F12` to open DevTools
3. Click "Toggle device toolbar" (phone icon)
4. Select device: iPhone 14 Pro Max or Pixel 7
5. Navigate to page you want to capture
6. Press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows)
7. Type "Capture full size screenshot"
8. Save to `/marketing/screenshots/`

### Using Mobile Device (Best Quality)
1. Open app on real iPhone/Android
2. Navigate to desired screen
3. Take screenshot (Power + Volume Up)
4. AirDrop/Transfer to computer
5. Crop to exact dimensions in Figma/Photoshop

### Post-Processing
- Remove sensitive data (names, emails, real amounts)
- Use placeholder data: "Demo User", "demo@converto.fi"
- Ensure consistent UI state (no loading spinners)
- Check for typos and alignment
- Verify brand colors match guidelines

---

## 🖌️ Design Tools

### Recommended Tools
1. **Figma** (Professional)
   - Best for precise layouts
   - Team collaboration
   - Component libraries

2. **Canva** (Quick & Easy)
   - Pre-made templates
   - Drag-and-drop interface
   - Fast exports

3. **Photoshop** (Advanced)
   - Pixel-perfect editing
   - Advanced effects
   - Batch processing

4. **Sketch** (Mac Only)
   - Native macOS app
   - Plugin ecosystem
   - iOS-focused

### Free Resources
- **Mockups:** https://mockuphone.com
- **Icons:** https://heroicons.com
- **Gradients:** https://uigradients.com
- **Fonts:** https://fonts.google.com (Inter)

---

## ✅ Quality Checklist

### Before Submission
- [ ] All text is legible (minimum 16px)
- [ ] No pixelation or compression artifacts
- [ ] Consistent branding across all screenshots
- [ ] No sensitive or real user data visible
- [ ] All UI elements properly aligned
- [ ] Colors match brand guidelines
- [ ] No typos or grammatical errors
- [ ] File sizes under 10MB each
- [ ] Correct dimensions for each platform
- [ ] PNG format (not JPEG for screenshots)

### A/B Testing Ideas
- Test different headlines
- Try with/without device frames
- Compare light vs dark backgrounds
- Test Finnish vs English text
- Experiment with CTA placement

---

## 📊 Performance Metrics

### Track After Launch
- **Conversion Rate:** Store page views → Downloads
- **Screenshot Engagement:** Which screenshots get most attention
- **Keyword Performance:** Which keywords drive traffic
- **Review Sentiment:** Positive vs negative mentions
- **Competitor Comparison:** How your visuals stack up

### Optimization Tips
- Update screenshots every 3-6 months
- Refresh for major feature releases
- Localize for different markets
- Test seasonal variations
- Monitor competitor changes

---

## 🚀 Launch Checklist

- [ ] All screenshots finalized
- [ ] App icon approved by team
- [ ] Copy reviewed and proofread
- [ ] Privacy policy published
- [ ] Support email active
- [ ] Test accounts created
- [ ] Promo video uploaded (if applicable)
- [ ] Social media assets prepared
- [ ] Press kit ready
- [ ] Launch announcement scheduled

---

**✅ Ready to create stunning store visuals! Follow this guide for maximum approval rate.**

**Need help?** Contact: support@converto.fi
