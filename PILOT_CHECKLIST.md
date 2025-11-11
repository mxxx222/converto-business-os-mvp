# 🎯 PILOT CUSTOMER CHECKLIST

## Pre-Launch (Before giving access)

### ✅ Technical Verification
- [ ] Backend health: `https://converto-backend.onrender.com/health` returns `{"status":"ok"}`
- [ ] Frontend loads: `https://converto-frontend.onrender.com` shows Dashboard
- [ ] OCR works: Upload test receipt → gets parsed correctly
- [ ] VAT calculation: Shows correct rates (25.5% standard for FI)
- [ ] Database: PostgreSQL connected and migrations run
- [ ] SSL/HTTPS: All pages load securely

### ✅ UI/UX Check
- [ ] Dashboard shows month cards (Menot, Tulot, ALV)
- [ ] Navigation works (all links clickable)
- [ ] Mobile responsive (test on phone)
- [ ] No console errors in browser DevTools
- [ ] Loading states show properly
- [ ] Error messages are user-friendly

### ✅ Content Check
- [ ] No "demo@" or "test" emails visible
- [ ] No Lorem ipsum text
- [ ] Finnish language throughout
- [ ] Brand name consistent (Converto™)
- [ ] Contact info / support link present

---

## Customer Setup

### 1. Create Pilot Account
```bash
python scripts/setup_pilot_customer.py "Yritys Oy" "asiakas@yritys.fi"
```

### 2. Send Welcome Email

**Subject:** Tervetuloa Converto Business OS -pilottiin! 🎉

**Body:**
```
Hei!

Olet mukana Converto Business OS -pilotissa!

🚀 Aloita tästä:
https://converto-frontend.onrender.com

📱 Mitä voit tehdä:
- Skannaa kuitteja (OCR AI)
- Laske ALV automaattisesti
- Lataa raportit PDF/CSV-muodossa

💡 Pikanäppäimet:
- Shift+O = Avaa kuittiskannaus
- Shift+S = Viimeisin kuitti
- Shift+R = Skannaa uudelleen

🆘 Tuki:
- Email: tuki@converto.fi
- Puhelin: [numero]

Pilotti on ilmainen 30 päivää.

Terveisin,
Converto Team
```

### 3. First Session Guide

**Walk customer through:**
1. Open `/selko/ocr`
2. Upload first receipt (photo or PDF)
3. Verify OCR results
4. Check `/vat` for month summary
5. Download report from `/reports`

---

## During Pilot (30 days)

### Week 1: Onboarding
- [ ] Customer uploads 5+ receipts
- [ ] VAT calculation verified
- [ ] First report downloaded
- [ ] Feedback call scheduled

### Week 2: Usage
- [ ] Daily active usage
- [ ] 20+ receipts scanned
- [ ] Gamification points visible
- [ ] No critical bugs reported

### Week 3: Value
- [ ] Customer saves time (track hours)
- [ ] VAT accuracy confirmed
- [ ] Integration needs identified
- [ ] Pricing discussion

### Week 4: Conversion
- [ ] Present pricing (29-99 €/month)
- [ ] Sign contract
- [ ] Setup billing (Stripe)
- [ ] Convert to paying customer! 💰

---

## Success Metrics

### Minimum Viable Pilot
- ✅ 30+ receipts scanned
- ✅ 0 VAT errors
- ✅ 2+ hours saved per month
- ✅ Customer satisfaction: 8+/10
- ✅ Willing to pay: Yes

### Ideal Pilot
- ✅ 100+ receipts
- ✅ Refers 1+ other businesses
- ✅ Requests additional features
- ✅ Testimonial provided
- ✅ Case study permission

---

## Troubleshooting

### Customer can't access
- Check URL is correct
- Verify SSL certificate
- Test in incognito mode

### OCR not working
- Check OPENAI_API_KEY in Render
- Verify image format (JPG/PNG/PDF)
- Check backend logs

### VAT wrong
- Verify receipt date
- Check VAT rates table
- Run `python scripts/seed_vat_rates.py`

---

## Post-Pilot Actions

### If Successful ✅
1. Convert to paid subscription
2. Request testimonial
3. Ask for referrals
4. Add to case studies

### If Unsuccessful ❌
1. Collect detailed feedback
2. Identify blockers
3. Improve product
4. Offer extended trial

---

**🎯 GOAL: First paying customer within 30 days!**
