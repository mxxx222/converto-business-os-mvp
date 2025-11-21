-- DocFlow Admin Dashboard - Supabase Schema Setup
-- Run this script in your Supabase SQL Editor to set up the required tables

-- ============================================
-- Documents Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  customer_id TEXT,
  customer_name TEXT,
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  upload_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  size TEXT,
  type TEXT DEFAULT 'other' CHECK (type IN ('invoice', 'receipt', 'contract', 'other')),
  error_message TEXT,
  ocr_confidence FLOAT,
  file_url TEXT,
  ocr_data JSONB
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON public.documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents(updated_at DESC);

-- ============================================
-- Activities Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- ============================================
-- Enable Realtime
-- ============================================
-- Enable Realtime for documents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;

-- Enable Realtime for activities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- Enable RLS on both tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Allow authenticated users to read all documents (admin dashboard)
CREATE POLICY "Allow authenticated users to read documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to update documents
CREATE POLICY "Allow authenticated users to update documents"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete documents
CREATE POLICY "Allow authenticated users to delete documents"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to read activities
CREATE POLICY "Allow authenticated users to read activities"
  ON public.activities
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert activities
CREATE POLICY "Allow authenticated users to insert activities"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- Functions
-- ============================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on documents
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Test Data (Optional - remove in production)
-- ============================================
-- Uncomment the following to insert test data:

/*
-- Test documents
INSERT INTO public.documents (filename, status, customer_name, priority, type, size) VALUES
('invoice_acme_jan2025.pdf', 'completed', 'Acme Corporation', 'high', 'invoice', '2.1 MB'),
('receipt_techsolutions_123.pdf', 'processing', 'Tech Solutions Oy', 'medium', 'receipt', '1.2 MB'),
('contract_globex_2025.pdf', 'error', 'Globex Corporation', 'high', 'contract', '3.4 MB'),
('invoice_initech_q1.pdf', 'pending', 'Initech', 'low', 'invoice', '1.8 MB'),
('receipt_officedepot_456.pdf', 'pending', 'Office Solutions Ltd', 'medium', 'receipt', '950 KB');

-- Test activities
INSERT INTO public.activities (type, message, metadata) VALUES
('document.uploaded', 'New document uploaded: invoice_acme_jan2025.pdf', '{"document_id": "test-1"}'),
('document.processing', 'Processing document: receipt_techsolutions_123.pdf', '{"document_id": "test-2"}'),
('document.completed', 'Document processed successfully: invoice_acme_jan2025.pdf', '{"document_id": "test-1"}'),
('document.failed', 'Failed to process: contract_globex_2025.pdf', '{"document_id": "test-3", "error": "OCR failed - poor image quality"}'),
('customer.created', 'New customer: Acme Corporation', '{"customer_id": "cust-1"}');
*/

-- ============================================
-- Verification
-- ============================================
-- Verify tables exist
SELECT 
  'documents' as table_name,
  COUNT(*) as row_count
FROM public.documents
UNION ALL
SELECT 
  'activities' as table_name,
  COUNT(*) as row_count
FROM public.activities;

-- Verify Realtime is enabled
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('documents', 'activities');

