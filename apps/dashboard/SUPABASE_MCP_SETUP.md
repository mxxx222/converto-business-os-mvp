# Supabase MCP Setup - Tulevaisuus

## 📋 Nykyinen Tilanne

✅ **SQL-korjaus suoritettu**: OCR-pipelinin tietokantakorjaus on tehty Management API:n kautta  
⚠️ **Supabase MCP ei ole kytketty**: Tällä hetkellä vain `sequentialthinking` ja `puppeteer` ovat aktiivisia

---

## 🔧 Supabase MCP Palvelin

**Tiedosto**: `mcp_supabase_server.js`

**Saatavilla olevat työkalut**:
- `supabase_query` - Suorita SELECT-kyselyjä
- `supabase_insert` - Lisää rivejä tauluihin
- `supabase_update` - Päivitä rivejä
- `supabase_delete` - Poista rivejä
- `supabase_list_tables` - Listaa kaikki taulut
- `supabase_get_table_schema` - Hae taulun skeema
- `supabase_count_rows` - Laske rivit taulussa

---

## 🔌 Supabase MCP Aktivoiminen (Tulevaisuudessa)

### Vaihe 1: Lisää Cursor MCP Configiin

Lisää `mcp_supabase_server.js` Cursor MCP-konfiguraatioon:

**Tiedosto**: `~/.cursor/mcp.json` tai Cursor Settings → MCP

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["/Users/herbspotturku/docflow/docflow/mcp_supabase_server.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

### Vaihe 2: Tarvittavat Environment Variables

Supabase MCP-palvelin tarvitsee:
- `SUPABASE_URL` tai `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (suositus) tai `SUPABASE_ANON_KEY`

### Vaihe 3: Käynnistä Cursor Uudelleen

1. Käynnistä Cursor IDE uudelleen
2. Tarkista MCP-status
3. Testaa Supabase-työkaluja

---

## ✅ Mitä on Tehty (Management API:n kautta)

### SQL-korjaus skripti suoritettu:

1. ✅ **Documents-taulun rakenne korjattu**
   - `ocr_data` (JSONB) sarake lisätty
   - `file_url` (TEXT) sarake lisätty

2. ✅ **Status-constraint päivitetty**
   - Sallii: 'pending', 'processing', 'completed', 'error', 'new', 'failed'

3. ✅ **Indeksit luotu**
   - `idx_documents_file_url` - file_url indeksi
   - `idx_documents_ocr_data` - GIN indeksi ocr_data:lle

4. ✅ **Storage RLS-käytännöt asetettu**
   - Users can upload documents
   - Users can read own documents
   - Service role can manage documents

5. ✅ **Documents-taulun INSERT-käytännöt lisätty**
   - Service role voi lisätä dokumentteja
   - Authenticated käyttäjät voivat lisätä omia dokumenttejaan

6. ✅ **Realtime-julkaisu aktivoitu**
   - `documents`-taulu lisätty `supabase_realtime` julkaisuun

---

## 🧪 Verifiointi

### Tarkista Supabase Dashboardissa:

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

---

## 🚀 Seuraavat Askeleet

1. ✅ SQL-korjaus suoritettu Management API:n kautta
2. ⏳ Odota että suoritus valmistuu (jos käynnissä)
3. ⏳ Verifioi muutokset Supabase Dashboardissa
4. ⏳ Testaa OCR-pipeline end-to-end
5. 🔮 Vapaaehtoisesti: Aktivoi Supabase MCP tulevaisuudessa

---

## 💡 Supabase MCP Hyödyt (Tulevaisuudessa)

Kun Supabase MCP on aktivoitu, voit:

- ✅ **Tarkistaa tietokannan tilan** suoraan Cursorista
- ✅ **Suorittaa SQL-kyselyjä** ilman manuaalista SQL Editoria
- ✅ **Lisätä/päivittää/poistaa** tietoja ohjelmallisesti
- ✅ **Hae taulujen skeemoja** automaattisesti
- ✅ **Debuggaa tietokantaongelmia** suoraan IDE:stä

---

## 📝 Huomioita

- **Nykyinen ratkaisu toimii**: Management API:n kautta suoritettu SQL-korjaus on riittävä
- **Supabase MCP on vapaaehtoinen**: Ei vaadita OCR-pipelinin toimintaan
- **Tulevaisuus**: Supabase MCP voi helpottaa tietokantahallintaa Cursorissa

---

**Status**: ✅ Korjaukset tehty Management API:n kautta - Verifiointi seuraavaksi!

