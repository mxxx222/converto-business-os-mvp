# Supabase OCR Pipeline - Korjausohjeet

Tämä ohje selittää miten korjata Supabase-tietokanta OCR-pipelinin vaatimusten mukaan.

## 📋 Mitä Korjataan

1. ✅ `documents`-taulun rakenne (lisätään `ocr_data` ja `file_url` sarakkeet)
2. ✅ Status-constraint (sallitaan 'new' arvo)
3. ✅ Storage RLS-käytännöt (`documents` bucket)
4. ✅ Documents-taulun INSERT-käytännöt
5. ✅ Realtime-julkaisu

## 🚀 Vaiheet

### 1. Avaa Supabase SQL Editor

1. Mene: https://supabase.com/dashboard/project/[PROJECT_ID]/editor
2. Valitse SQL Editor -välilehti
3. Klikkaa "New Query"

### 2. Suorita Korjaus-SQL

1. Avaa tiedosto: `apps/dashboard/supabase-ocr-fix.sql`
2. Kopioi koko SQL-sisältö
3. Liitä se Supabase SQL Editoriin
4. Klikkaa "Run" tai paina `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

### 3. Tarkista Tulokset

SQL-skripti suorittaa verifiointikyselyt automaattisesti. Tarkista että:
- ✅ `ocr_data` sarake on lisätty
- ✅ `file_url` sarake on lisätty  
- ✅ Status-constraint sallii 'new' arvon
- ✅ Storage-käytännöt on luotu
- ✅ Realtime on käytössä

### 4. Luo Storage Bucket (jos puuttuu)

1. Mene: Supabase Dashboard → Storage
2. Klikkaa "New bucket"
3. Nimi: `documents`
4. Public: **No** (private bucket)
5. Klikkaa "Create bucket"

### 5. Verifioi

Testaa OCR-pipeline:
1. Mene: https://dashboard-bli5l1uwd-maxs-projects-149851b4.vercel.app/test
2. Lataa testi-kuitti
3. Tarkista että se tallennetaan `documents`-tauluun

## 🔍 Tarkistuslistaus

### Documents-taulun rakenne
- [ ] `ocr_data JSONB` sarake on olemassa
- [ ] `file_url TEXT` sarake on olemassa
- [ ] Status-constraint sallii: 'pending', 'processing', 'completed', 'error', 'new', 'failed'

### Storage
- [ ] Bucket `documents` on luotu
- [ ] RLS-käytännöt on asetettu:
  - [ ] "Users can upload documents"
  - [ ] "Users can read own documents"
  - [ ] "Service role can manage documents"

### RLS-käytännöt (documents-taulu)
- [ ] Service role voi INSERT
- [ ] Service role voi UPDATE
- [ ] Service role voi SELECT
- [ ] Authenticated käyttäjät voivat INSERT omia dokumenttejaan

### Realtime
- [ ] `documents`-taulu on Realtime-julkaisussa

## ⚠️ Huomioita

1. **Storage bucket** täytyy luoda **manuaalisesti** Supabase Dashboardissa
2. **Service role key** täytyy olla asennettuna Vercel environment variablesissa
3. SQL-skripti on **idempotentti** - se voi ajaa turvallisesti useita kertoja

## 🐛 Ongelmatilanteet

### Ongelma: "relation documents does not exist"
**Ratkaisu**: Suorita ensin `supabase-schema.sql` luodaksesi taulun

### Ongelma: "permission denied for table documents"
**Ratkaisu**: Tarkista että service role key on oikein Vercelissa

### Ongelma: "bucket documents does not exist"
**Ratkaisu**: Luo bucket manuaalisesti Supabase Dashboardissa

## ✅ Valmis!

Kun kaikki vaiheet on suoritettu, OCR-pipeline pitäisi toimia oikein.

Testaa:
```bash
curl -X POST https://dashboard-bli5l1uwd-maxs-projects-149851b4.vercel.app/api/documents/upload \
  -F "file=@test-receipt.jpg" \
  -F "userId=test-user"
```

