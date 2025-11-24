-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  file_url TEXT,
  ocr_data JSONB,
  confidence FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);

-- Activities table (real-time feed)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Test data
INSERT INTO documents (filename, status, confidence) VALUES
  ('invoice-001.pdf', 'completed', 0.95),
  ('receipt-123.jpg', 'processing', NULL),
  ('contract-456.pdf', 'pending', NULL);

INSERT INTO activities (type, message) VALUES
  ('document.uploaded', 'New document uploaded: invoice-001.pdf'),
  ('ocr.completed', 'OCR completed for receipt-123.jpg');