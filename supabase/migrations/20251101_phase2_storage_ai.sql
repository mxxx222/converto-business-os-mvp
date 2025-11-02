upabase/migrations/20251101_phase2_storage_ai.sql</path>
<content">-- Phase 2: Storage & AI Implementation
-- Database Schema for Document Processing and Storage

-- Create storage buckets for Phase 2
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES
  ('documents', 'documents', false, now(), now()),
  ('images', 'images', true, now(), now()),
  ('reports', 'reports', false, now(), now()),
  ('uploads', 'uploads', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Document Processing Table
CREATE TABLE IF NOT EXISTS document_processing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image', 'document')),
  processing_type TEXT NOT NULL CHECK (processing_type IN ('ocr', 'summary', 'analysis')),
  result JSONB NOT NULL,
  processing_time INTEGER NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Metadata Table
CREATE TABLE IF NOT EXISTS file_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  thumbnail_path TEXT,
  processed BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Collaboration Sessions
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID,
  session_name TEXT NOT NULL,
  host_user_id UUID NOT NULL REFERENCES auth.users(id),
  participants UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Processing Queue
CREATE TABLE IF NOT EXISTS ai_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_id UUID REFERENCES file_metadata(id),
  processing_type TEXT NOT NULL,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Storage Policies (Row Level Security)

-- Document Processing Policies
ALTER TABLE document_processing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own processing results" ON document_processing
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processing results" ON document_processing
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- File Metadata Policies
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files" ON file_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" ON file_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON file_metadata
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON file_metadata
  FOR DELETE USING (auth.uid() = user_id);

-- Collaboration Sessions Policies
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions they participate in" ON collaboration_sessions
  FOR SELECT USING (
    auth.uid() = host_user_id OR
    auth.uid() = ANY(participants)
  );

CREATE POLICY "Users can create collaboration sessions" ON collaboration_sessions
  FOR INSERT WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Session hosts can update their sessions" ON collaboration_sessions
  FOR UPDATE USING (auth.uid() = host_user_id);

-- AI Processing Queue Policies
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own processing queue" ON ai_processing_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processing requests" ON ai_processing_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own processing requests" ON ai_processing_queue
  FOR UPDATE USING (auth.uid() = user_id);

-- Storage Policies
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_document_processing_user_id ON document_processing(user_id);
CREATE INDEX IF NOT EXISTS idx_document_processing_file_path ON document_processing(file_path);
CREATE INDEX IF NOT EXISTS idx_document_processing_type ON document_processing(processing_type);
CREATE INDEX IF NOT EXISTS idx_document_processing_created_at ON document_processing(created_at);

CREATE INDEX IF NOT EXISTS idx_file_metadata_user_id ON file_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_file_metadata_file_path ON file_metadata(file_path);
CREATE INDEX IF NOT EXISTS idx_file_metadata_processed ON file_metadata(processed);

CREATE INDEX IF NOT EXISTS idx_ai_queue_user_id ON ai_processing_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON ai_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_queue_priority ON ai_processing_queue(priority);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_processing_updated_at BEFORE UPDATE ON document_processing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_metadata_updated_at BEFORE UPDATE ON file_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_updated_at BEFORE UPDATE ON collaboration_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Real-time Subscriptions
-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE document_processing;
ALTER PUBLICATION supabase_realtime ADD TABLE file_metadata;
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_sessions;

-- Functions for Phase 2 features

-- Function to get file processing history
CREATE OR REPLACE FUNCTION get_user_processing_history(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  file_name TEXT,
  processing_type TEXT,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dp.id,
    fm.file_name,
    dp.processing_type,
    dp.result,
    dp.created_at
  FROM document_processing dp
  JOIN file_metadata fm ON dp.file_path = fm.file_path
  WHERE dp.user_id = user_uuid
  ORDER BY dp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get processing statistics
CREATE OR REPLACE FUNCTION get_user_processing_stats(user_uuid UUID DEFAULT auth.uid())
RETURNS JSON AS $$
DECLARE
  total_processed INTEGER;
  ocr_count INTEGER;
  summary_count INTEGER;
  analysis_count INTEGER;
  avg_processing_time INTEGER;
BEGIN
  SELECT
    COUNT(*),
    COUNT(CASE WHEN processing_type = 'ocr' THEN 1 END),
    COUNT(CASE WHEN processing_type = 'summary' THEN 1 END),
    COUNT(CASE WHEN processing_type = 'analysis' THEN 1 END),
    AVG(processing_time)
  INTO total_processed, ocr_count, summary_count, analysis_count, avg_processing_time
  FROM document_processing
  WHERE user_id = user_uuid;

  RETURN json_build_object(
    'total_processed', total_processed,
    'ocr_count', ocr_count,
    'summary_count', summary_count,
    'analysis_count', analysis_count,
    'avg_processing_time', avg_processing_time
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
