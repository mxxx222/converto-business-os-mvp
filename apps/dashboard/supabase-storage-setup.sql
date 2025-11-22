-- Supabase Storage Setup for OCR Pipeline
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Create Documents Bucket (if not exists)
-- ============================================
-- Note: Bucket creation must be done via Supabase Dashboard → Storage
-- This SQL assumes the bucket already exists

-- ============================================
-- 2. Storage RLS Policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage documents" ON storage.objects;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own files
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow service role to manage all files (for server-side operations)
CREATE POLICY "Service role can manage documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- ============================================
-- 3. Verify Documents Table Schema
-- ============================================
-- Ensure the documents table has the required columns

-- Add ocr_data column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'ocr_data'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN ocr_data JSONB;
  END IF;
END $$;

-- Add file_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN file_url TEXT;
  END IF;
END $$;

-- Ensure status can be 'new'
DO $$ 
BEGIN
  -- Check if constraint exists and allows 'new'
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'documents_status_check' 
    AND contype = 'c'
  ) THEN
    -- Drop old constraint if exists
    ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_check;
    -- Add new constraint with 'new' status
    ALTER TABLE public.documents ADD CONSTRAINT documents_status_check 
      CHECK (status IN ('pending', 'processing', 'completed', 'error', 'new'));
  END IF;
END $$;

-- ============================================
-- 4. Verification Queries
-- ============================================

-- Verify bucket exists (run in Supabase Dashboard → Storage)
-- SELECT * FROM storage.buckets WHERE name = 'documents';

-- Verify policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%documents%';

-- Verify documents table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents' 
  AND table_schema = 'public'
  AND column_name IN ('ocr_data', 'file_url', 'status')
ORDER BY column_name;

