# 🧪 TESTAA OCR-PIPELINE NYT (5 min)

**Status**: ✅ Kaikki tekninen työ valmis - Nyt testaaminen!

---

## 🚀 Nopea Testaus (5 minuuttia)

### 1. Avaa Demo-sivu

**URL**: https://dashboard-bli5l1uwd-maxs-projects-149851b4.vercel.app/test

**Odotettava**:
- ✅ Sivu latautuu ilman virheitä
- ✅ Upload-alue näkyy
- ✅ "Drop receipt here or click to upload" teksti näkyy

---

### 2. Lataa Testi-kuitti

**Toimet**:
1. Klikkaa upload-aluetta
2. Valitse kuitin kuva (JPG/PNG/WebP)
   - S-market, K-kauppa, Lidl, tai mikä tahansa suomalainen kuitti
3. Klikkaa "Process Receipt"

**Odotettava sekvenssi**:
- ✅ Upload-status näkyy (1-2 sekuntia)
- ✅ Processing-status näkyy (2-5 sekuntia)
- ✅ "Extracted Data" näkyy

---

### 3. Tarkista Tulokset

**Odotettava JSON-data**:
```json
{
  "store": "S-market" (tai muu),
  "date": "2025-01-XX",
  "total": 12.34,
  "vat": 2.34,
  "items": [...],
  "payment_method": "Card",
  "receipt_number": "..."
}
```

**Tarkista**:
- ✅ Store name oikein?
- ✅ Total amount oikein?
- ✅ Date formaatti YYYY-MM-DD?
- ✅ VAT laskettu oikein?

---

## ✅ Jos Toimii → Siirry Myyntiin!

### Seuraavat Askeleet:

1. **Nauhoita 30s demo** (30 min)
   - Seuraa `DEMO_SCRIPT.md`
   - Upload → Processing → Results
   - Lataa Loom/YouTube (unlisted)

2. **Lähetä 3 prospektille** (huomenna)
   - Email: "See DocFlow in action: [demo-link]"
   - Call-to-action: "Ready for beta testing"

3. **Potentiaali**: €149+ MRR ensimmäisestä asiakkaasta viikossa

---

## 🔴 Jos Ei Toimi → Debug

### Vaihe 1: Tarkista Console

**Browser DevTools** (F12):
- **Console-välilehti**: Onko punaisia virheitä?
- **Network-välilehti**: Onko API-kutsut epäonnistuneet?
  - `/api/documents/upload` → Status 200?
  - `/api/ocr/process` → Status 200?
  - `/api/documents/[id]` → Status 200?

### Vaihe 2: Tarkista Vercel Logs

```bash
cd apps/dashboard
vercel inspect dashboard-bli5l1uwd-maxs-projects-149851b4.vercel.app --logs
```

**Etsi virheitä**:
- ❌ "OPENAI_API_KEY not configured" → Tarkista env vars
- ❌ "Document not found" → Tarkista Supabase connection
- ❌ "Failed to upload file" → Tarkista Storage bucket

### Vaihe 3: Tarkista Supabase

**Supabase Dashboard**:
1. **Table Editor** → `documents`:
   - Luotiinko uusi dokumentti?
   - `status`: `new` → `processing` → `completed`?
   - `ocr_data`: Onko JSON-data siellä?

2. **Storage** → `documents` bucket:
   - Uploadautuko tiedosto?
   - Onko tiedoston URL oikein?

### Vaihe 4: Tarkista Environment Variables

```bash
cd apps/dashboard
vercel env list production | grep -E "(OPENAI|SUPABASE|APP_URL)"
```

**Varmista**:
- ✅ `OPENAI_API_KEY` on set
- ✅ `SUPABASE_SERVICE_ROLE_KEY` on set
- ✅ `NEXT_PUBLIC_APP_URL` on set

---

## 🐛 Yleisimmät Ongelmat

### Ongelma: "Upload failed"
**Ratkaisu**: 
- Tarkista Storage bucket `documents` on luotu
- Tarkista Storage RLS-käytännöt

### Ongelma: "Processing failed"
**Ratkaisu**:
- Tarkista `OPENAI_API_KEY` on set
- Tarkista OpenAI API-quotas

### Ongelma: "Document not found"
**Ratkaisu**:
- Tarkista Supabase connection
- Tarkista `SUPABASE_SERVICE_ROLE_KEY`

### Ongelma: "No OCR data displayed"
**Ratkaisu**:
- Tarkista Supabase `documents` table
- Tarkista `ocr_data` kenttä on täytetty

---

## 📊 Testaus-Checklist

- [ ] Demo-sivu latautuu
- [ ] File upload toimii
- [ ] Processing-status näkyy
- [ ] OCR-data näkyy
- [ ] Store name oikein
- [ ] Total amount oikein
- [ ] Date formaatti oikein
- [ ] Ei console-virheitä

---

## 🎯 Seuraavat Askeleet

### Jos ✅ TOIMII:
1. ✅ Nauhoita demo (30 min)
2. ✅ Lähetä 3 prospektille huomenna
3. ✅ Valmistaudu ensimmäiseen maksavaan asiakkaaseen

### Jos ❌ EI TOIMI:
1. ❌ Debug console errors
2. ❌ Tarkista Vercel logs
3. ❌ Verifioi Supabase data
4. ❌ Korjaa ongelmat
5. 🔄 Testaa uudelleen

---

**TEKNINEN TYÖ DONE. NYT TESTAA JA MYY!** 🚀

**Production URL**: https://dashboard-bli5l1uwd-maxs-projects-149851b4.vercel.app/test

