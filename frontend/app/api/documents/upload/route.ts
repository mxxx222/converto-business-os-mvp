import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed: JPG, PNG, PDF' 
      }, { status: 400 });
    }
    
    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload file',
        details: uploadError.message 
      }, { status: 500 });
    }
    
    // Create document record
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        storage_path: uploadData.path,
        file_size: file.size,
        content_type: file.type,
        status: 'processing',
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database insert error:', dbError);
      
      // Clean up uploaded file
      await supabase.storage
        .from('documents')
        .remove([uploadData.path]);
      
      return NextResponse.json({ 
        error: 'Failed to create document record',
        details: dbError.message 
      }, { status: 500 });
    }
    
    // Trigger OCR processing (async - don't wait for response)
    triggerOCRProcessing(document.id, uploadData.path, user.id).catch(err => {
      console.error('Failed to trigger OCR:', err);
    });
    
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        status: document.status,
        file_name: document.file_name,
        created_at: document.created_at,
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function triggerOCRProcessing(documentId: string, storagePath: string, userId: string) {
  // Call OCR processing endpoint
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${backendUrl}/api/v1/receipts/process`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_id: documentId,
        storage_path: storagePath,
        user_id: userId,
      }),
    });
    
    if (!response.ok) {
      console.error('OCR trigger failed:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Failed to trigger OCR:', error);
    // Don't throw - this is fire-and-forget
  }
}

