# ✅ Render Environment Variables - Checklist

**Backend Service:** `srv-d3r10pjipnbc73asaod0` (converto-business-os-quantum-mvp-1)

## 🔴 **Kriittiset (Aseta Nyt):**

```
✅ SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232

✅ SUPABASE_URL=https://your-project.supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY=sbp_3239ba703a96cee5e258396939111c5db2aecd9c
✅ SUPABASE_AUTH_ENABLED=true

⚠️ DATABASE_URL=postgresql://user:password@host:5432/database (PÄIVITÄ!)
⚠️ OPENAI_API_KEY=sk-proj-xxxx (PÄIVITÄ!)
⚠️ RESEND_API_KEY=re_xxxx (PÄIVITÄ!)

✅ ENVIRONMENT=production
✅ LOG_LEVEL=info
```

## 📋 **Asetusohjeet:**

1. **Render Dashboard:**
   - https://dashboard.render.com
   - Service: `converto-business-os-quantum-mvp-1`
   - Settings → Environment

2. **Lisää muuttujat yksi kerrallaan:**
   - Key: `SENTRY_DSN`
   - Value: `https://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@o4507887226847232.ingest.sentry.io/4507887226847232`
   - Save

3. **Yksi kerrallaan:** Lisää kaikki muut muuttujat

4. **Redeploy:**
   - Manual Deploy → Deploy latest commit

5. **Testaa:**
   ```bash
   curl https://converto-business-os-quantum-mvp-1.onrender.com/health
   ```

---

**Aika:** ~10 minuuttia

