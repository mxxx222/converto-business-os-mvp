# Supabase OCR Pipeline Fix - Verifiointiohje

## ✅ SQL-korjaus Suoritettu

OCR-pipelinin tietokantakorjaus on suoritettu Management API:n kautta. Tarkista että kaikki muutokset ovat oikein.

---

## 🔍 Nopea Verifiointi

### 1. Tarkista Documents-taulun Rakenne

**Supabase SQL Editor**:
```sql
-- Tarkista että sarakkeet ovat olemassa
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'documents'
  AND column_name IN ('ocr_data', 'file_url', 'status')
ORDER BY column_name;
```

**Odotettavat tulokset:**
- `ocr_data` | `jsonb` | `YES` | `NULL`
- `file_url` | `text` | `YES` | `NULL`
- `status` | `text` | `NO` | `'pending'::text`

### 2. Tarkista Status-Constraint

```sql
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'documents_status_check';
```

**Odotettava:** Constraint sallii: 'pending', 'processing', 'completed', 'error', 'new', 'failed'

### 3. Tarkista Storage RLS-käytännöt

```sql
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  CASE WHEN qual IS NOT NULL THEN 'YES' ELSE 'NO' END as has_using,
  CASE WHEN with_check IS NOT NULL THEN 'YES' ELSE 'NO' END as has_with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%documents%'
ORDER BY policyname;
```

**Odotettavat käytännöt:**
- `Service role can manage documents` - ALL - service_role
- `Users can read own documents` - SELECT - authenticated
- `Users can upload documents` - INSERT - authenticated

### 4. Tarkista Documents-taulun RLS-käytännöt

```sql
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'documents'
  AND schemaname = 'public'
  AND cmd = 'INSERT'
ORDER BY policyname;
```

**Odotettavat käytännöt:**
- `Service role can insert documents` - INSERT - service_role
- `Allow authenticated users to insert documents` - INSERT - authenticated

### 5. Tarkista Realtime-julkaisu

```sql
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'documents';
```

**Odotettava:** Yksi rivi: `public` | `documents`

---

## 🧪 Testaus

### Testi 1: File Upload

```bash
curl -X POST https://dashboard-bli5l1uwd-maxs-projects-149851b4.vercel.app/api/documents/upload \
  -F "file=@test-receipt.jpg" \
  -F "userId=test-user"
```

**Odotettava vastaus:**
```json
{
  "success": true,
  "document": {
    "id": "...",
    "filename": "test-receipt.jpg",
    "status": "new",
    "file_url": "https://..."
  }
}
```

### Testi 2: Tarkista Supabase Dashboard

1. Mene: **Table Editor** → `documents`
2. Tarkista että uusi dokumentti on luotu:
   - `status`: `new`
   - `file_url`: URL-osoite (ei NULL)
   - `ocr_data`: `null` (ennen OCR-prosessointia)

### Testi 3: OCR Processing

Odota 2-5 sekuntia ja tarkista:
1. `status` muuttuu: `new` → `processing` → `completed`
2. `ocr_data` kentässä on JSON-tulokset:
   ```json
   {
     "store": "...",
     "date": "2025-01-15",
     "total": 12.34,
     "vat": 2.34,
     ...
   }
   ```

---

## ✅ Verifiointilista

- [ ] `ocr_data` sarake on olemassa (JSONB)
- [ ] `file_url` sarake on olemassa (TEXT)
- [ ] Status-constraint sallii 'new' arvon
- [ ] Storage RLS-käytännöt on luotu (3 käytäntöä)
- [ ] Documents INSERT-käytännöt on luotu (2 käytäntöä)
- [ ] Realtime-julkaisu aktiivinen
- [ ] File upload toimii
- [ ] OCR processing toimii
- [ ] Tulokset tallennetaan `ocr_data` kenttään

---

## 🐛 Ongelmatilanteet

### Ongelma: "column ocr_data does not exist"
**Ratkaisu**: Suorita `supabase-ocr-fix.sql` uudelleen manuaalisesti

### Ongelma: "status value 'new' violates check constraint"
**Ratkaisu**: Status-constraint pitää päivittää - suorita SQL-korjaus uudelleen

### Ongelma: "permission denied for table documents"
**Ratkaisu**: Tarkista että INSERT-käytännöt ovat olemassa

### Ongelma: "bucket documents does not exist"
**Ratkaisu**: Luo bucket manuaalisesti: Storage → New bucket → `documents`

---

## 📊 Yhteenveto

✅ **SQL-korjaus suoritettu** Management API:n kautta  
⏳ **Odotetaan valmistumista** (jos suoritus on käynnissä)  
🔍 **Verifiointi**: Suorita yllä olevat tarkistukset  
🧪 **Testaus**: Testaa OCR-pipeline end-to-end  
✅ **Valmis**: Kun kaikki toimii, OCR-pipeline on käyttövalmis!

---

**Status**: ✅ Korjaukset tehty - Verifioi ja testaa seuraavaksi!

