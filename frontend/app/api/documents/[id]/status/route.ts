import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const documentId = params.id;
    
    // Get document status
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, status, ocr_confidence, ocr_provider, fallback_used, processed_at')
      .eq('id', documentId)
      .single();
    
    if (docError) {
      if (docError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }
    
    return NextResponse.json({
      id: document.id,
      status: document.status,
      ocr_confidence: document.ocr_confidence,
      ocr_provider: document.ocr_provider,
      fallback_used: document.fallback_used,
      processed_at: document.processed_at,
      is_processing: document.status === 'processing' || document.status === 'uploading',
      is_completed: document.status === 'completed',
      is_failed: document.status === 'failed',
    });
    
  } catch (error) {
    console.error('Get status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}

