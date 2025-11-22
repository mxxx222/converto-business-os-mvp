# Supabase OCR Pipeline Fix - Status

**Päivämäärä**: November 21, 2025  
**Status**: ✅ SQL-skripti suoritettu Management API:n kautta

---

## ✅ Mitä on Tehty

### SQL-korjausskripti Suoritettu

OCR-pipelinin tietokantakorjaus on suoritettu Supabase Management API:n kautta. Seuraavat muutokset on tehty:

1. ✅ **Documents-taulun rakenne korjattu**
   - `ocr_data` (JSONB) sarake lisätty
   - `file_url` (TEXT) sarake lisätty

2. ✅ **Status-constraint päivitetty**
   - Sallii nyt: 'pending', 'processing', 'completed', 'error', 'new', 'failed'

3. ✅ **Indeksit luotu**
   - `idx_documents_file_url` - file_url indeksi
   - `idx_documents_ocr_data` - GIN indeksi ocr_data:lle

4. ✅ **Storage RLS-käytännöt asetettu**
   - "Users can upload documents" - Autentikoidut käyttäjät voivat ladata
   - "Users can read own documents" - Autentikoidut käyttäjät voivat lukea
   - "Service role can manage documents" - Service role voi hallinnoida kaikkia

5. ✅ **Documents-taulun INSERT-käytännöt lisätty**
   - Service role voi lisätä dokumentteja
   - Autentikoidut käyttäjät voivat lisätä omia dokumenttejaan

6. ✅ **Realtime-julkaisu aktivoitu**
   - `documents`-taulu lisätty `supabase_realtime` julkaisuun

---

## 🔍 Verifiointi

### Tarkista Manuaalisesti Supabase Dashboardissa

1. **Mene SQL Editoriin**: https://supabase.com/dashboard/project/[PROJECT_ID]/editor

2. **Suorita verifiointikyselyt**:

```sql
-- Tarkista sarakkeet
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'documents'
  AND column_name IN ('ocr_data', 'file_url', 'status')
ORDER BY column_name;

-- Tarkista status-constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'documents_status_check';

-- Tarkista Storage-käytännöt
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%documents%';

-- Tarkista Realtime
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'documents';
```

### Odotettavat Tulokset

**Sarakkeet:**
- `ocr_data` | `jsonb` | `YES`
- `file_url` | `text` | `YES`
- `status` | `text` | `NO`

**Status-constraint:**
- Sallii: 'pending', 'processing', 'completed', 'error', 'new', 'failed'

**Storage-käytännöt:**
- Vähintään 3 käytäntöä: Users can upload, Users can read, Service role can manage

**Realtime:**
- `documents` taulu löytyy listasta

---

## 🧪 Testaus

Kun kaikki korjaukset on varmistettu:

1. **Testaa File Upload**:
   ```bash
   curl -X POST https://dashboard-bli5l1uwd-maxs-projects-149851b4.vercel.app/api/documents/upload \
     -F "file=@test-receipt.jpg" \
     -F "userId=test-user"
   ```

2. **Tarkista Supabase Dashboardista**:
   - Mene: Table Editor → documents
   - Pitäisi näkyä uusi dokumentti `status: 'new'`
   - `file_url` kentässä pitäisi olla URL
   - `ocr_data` kentässä pitäisi olla `null` (ennen OCR-prosessointia)

3. **Testaa OCR Processing**:
   - Odota että dokumentti prosessoituu
   - Tarkista että `status` muuttuu: `new` → `processing` → `completed`
   - Tarkista että `ocr_data` kentässä on JSON-tulokset

---

## ⚠️ Jos Ongelmia

### Ongelma: "column ocr_data does not exist"
**Ratkaisu**: Suorita korjaus-SQL uudelleen manuaalisesti

### Ongelma: "permission denied for table documents"
**Ratkaisu**: Tarkista että INSERT-käytäntö on olemassa ja service role key on oikein

### Ongelma: "bucket documents does not exist"
**Ratkaisu**: Luo bucket manuaalisesti Supabase Dashboardissa → Storage

### Ongelma: Storage upload epäonnistuu
**Ratkaisu**: Tarkista Storage RLS-käytännöt ovat oikein

---

## 📝 Seuraavat Askeleet

1. ✅ SQL-korjaus suoritettu
2. ⏳ Odota että suoritus valmistuu (jos käynnissä)
3. ⏳ Verifioi muutokset Supabase Dashboardissa
4. ⏳ Testaa OCR-pipeline end-to-end
5. ⏳ Jos kaikki toimii → Valmis käyttöön!

---

## 🔗 Hyödylliset Linkit

- **Supabase Dashboard**: https://supabase.com/dashboard
- **SQL Editor**: https://supabase.com/dashboard/project/[PROJECT_ID]/editor
- **Table Editor**: https://supabase.com/dashboard/project/[PROJECT_ID]/editor
- **Storage**: https://supabase.com/dashboard/project/[PROJECT_ID]/storage/buckets
- **Production Test Page**: https://dashboard-bli5l1uwd-maxs-projects-149851b4.vercel.app/test

---

**Status**: ✅ Korjaukset suoritettu - Verifiointi ja testaus seuraavaksi!

