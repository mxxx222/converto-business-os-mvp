# Supabase Realtime - Nopea Aktivointi

## ✅ **Vaihe 1: Enable Realtime receipts-taululle**

1. **Avaa Supabase Dashboard:**
   - https://app.supabase.com/
   - Valitse projektisi

2. **Table Editor:**
   - Vasemmalta: **Table Editor**
   - Valitse: **receipts** table

3. **Realtime Settings:**
   - Klikkaa **Settings** (oikealla ylhäällä)
   - Etsi **Realtime** -osio
   - Laita **Enable Realtime** → **ON** ✅
   - Valitse eventit:
     - ✅ **INSERT**
     - ✅ **UPDATE**  
     - ✅ **DELETE**

4. **Save:**
   - Klikkaa **Save**

**✅ Valmis!** Nyt frontend dashboard päivittyy automaattisesti kun uusi kuitti lisätään.

---

## ✅ **Vaihe 2: Hae Supabase Anon Key (Frontend)**

1. **Supabase Dashboard:**
   - Settings (⚙️ vasemmalta)
   - **API**

2. **Copy Keys:**
   - **Project URL:** `https://xxxxx.supabase.co` → Kopioi tämä
   - **anon public:** `eyJhbGc...` → Kopioi tämä (pitkä string)

3. **Aseta Frontend Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

---

## ✅ **Vaihe 3: Testaa Realtime**

1. **Avaa Dashboard:**
   - Frontend: `/dashboard`
   - Login (jos required)

2. **Testaa:**
   - Upload uusi kuitti backend:in kautta
   - TAI lisää suoraan Supabase table editorissa
   - Dashboard pitäisi päivittyä **automaattisesti** (ei refresh-nappia!)

**✅ Jos dashboard päivittyy → Realtime toimii!**

---

## 📝 **Checklist:**

- [ ] Realtime enabled receipts-taululle
- [ ] INSERT, UPDATE, DELETE events enabled
- [ ] NEXT_PUBLIC_SUPABASE_URL asetettu
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY asetettu
- [ ] Testattu: Dashboard päivittyy automaattisesti

---

**Aika:** ~5 minuuttia

