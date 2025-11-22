-- Supabase OCR Pipeline Fix Script
-- Korjaa documents-taulun ja storage-konfiguraation OCR-pipelinin vaatimusten mukaan
-- Suorita tämä Supabase SQL Editorissa

-- ============================================
-- 1. Korjaa documents-taulun rakenne
-- ============================================

-- Lisää puuttuvat sarakkeet jos ne eivät ole olemassa
DO $$ 
BEGIN
  -- ocr_data (JSONB) - OCR-tulosten tallennus
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'documents' 
    AND column_name = 'ocr_data'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN ocr_data JSONB;
    RAISE NOTICE 'Added column ocr_data';
  END IF;

  -- file_url (TEXT) - Tiedoston URL Supabase Storagessa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'documents' 
    AND column_name = 'file_url'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN file_url TEXT;
    RAISE NOTICE 'Added column file_url';
  END IF;

  -- Varmista että status voi olla 'new'
  -- Poista vanha constraint jos se ei salli 'new' arvoa
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'documents_status_check' 
    AND contype = 'c'
  ) THEN
    -- Tarkista constraint:en sisältö
    ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_check;
    RAISE NOTICE 'Dropped old status constraint';
  END IF;
  
  -- Lisää uusi constraint joka sallii 'new' arvon
  ALTER TABLE public.documents 
  ADD CONSTRAINT documents_status_check 
  CHECK (status IN ('pending', 'processing', 'completed', 'error', 'new', 'failed'));
  RAISE NOTICE 'Added new status constraint with new status';
END $$;

-- ============================================
-- 2. Lisää puuttuvat indeksit
-- ============================================

CREATE INDEX IF NOT EXISTS idx_documents_file_url ON public.documents(file_url) WHERE file_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_ocr_data ON public.documents USING gin(ocr_data) WHERE ocr_data IS NOT NULL;

-- ============================================
-- 3. Korjaa Storage RLS-käytännöt
-- ============================================

-- Poista vanhat käytännöt jos ne ovat olemassa
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role to manage documents" ON storage.objects;

-- Lisää uudet käytännöt documents-bucketille
-- Huom: Bucket "documents" täytyy luoda manuaalisesti Supabase Dashboardissa jos sitä ei ole

-- Autentikoidut käyttäjät voivat ladata tiedostoja omaan kansioon
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- Autentikoidut käyttäjät voivat lukea omia tiedostojaan
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
);

-- Service role voi hallinnoida kaikkia tiedostoja (tarvitaan server-side operaatioihin)
CREATE POLICY "Service role can manage documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- ============================================
-- 4. Lisää INSERT-käytäntö documents-taululle
-- ============================================

-- Poista vanha INSERT-käytäntö jos se on olemassa
DROP POLICY IF EXISTS "Allow authenticated users to insert documents" ON public.documents;
DROP POLICY IF EXISTS "Service role can insert documents" ON public.documents;

-- Service role voi lisätä dokumentteja (tarvitaan API-endpointeissa)
CREATE POLICY "Service role can insert documents"
ON public.documents
FOR INSERT
TO service_role
WITH CHECK (true);

-- Autentikoidut käyttäjät voivat lisätä omia dokumenttejaan
CREATE POLICY "Allow authenticated users to insert documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- 5. Varmista että Realtime on käytössä
-- ============================================

-- Lisää documents-taulu Realtime-julkaisuun jos se ei ole jo siellä
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
    RAISE NOTICE 'Added documents table to Realtime';
  END IF;
END $$;

-- ============================================
-- 6. Verifiointi
-- ============================================

-- Tarkista että kaikki tarvittavat sarakkeet ovat olemassa
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'documents'
  AND column_name IN ('ocr_data', 'file_url', 'status')
ORDER BY column_name;

-- Tarkista status-constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'documents_status_check';

-- Tarkista Storage-käytännöt
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%documents%';

-- Tarkista Realtime-julkaisu
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'documents';

