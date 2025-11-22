import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No userId provided' },
        { status: 400 }
      )
    }

    // Validate file type (images only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image (JPEG, PNG, or WebP)' },
        { status: 400 }
      )
    }

    // Create admin Supabase client for service role access
    const supabase = createAdminSupabaseClient()

    // 1. Upload to Supabase Storage
    const timestamp = Date.now()
    const fileName = `${userId}/${timestamp}-${file.name}`
    
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // 2. Get public URL (or signed URL for private bucket)
    const { data: urlData } = supabase
      .storage
      .from('documents')
      .getPublicUrl(fileName)

    // For private buckets, we'd use createSignedUrl instead
    // For now, using public URL - adjust if bucket is private
    const fileUrl = urlData.publicUrl

    // 3. Create document record in database
    const { data: doc, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        filename: file.name,
        file_url: fileUrl,
        status: 'new',
        type: 'receipt', // Default to receipt for demo
        size: `${(file.size / 1024).toFixed(2)} KB`,
        upload_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up uploaded file
      await supabase.storage.from('documents').remove([fileName])
      return NextResponse.json(
        { error: `Failed to create document record: ${dbError.message}` },
        { status: 500 }
      )
    }

    // 4. Trigger OCR processing asynchronously
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    fetch(`${appUrl}/api/ocr/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: doc.id })
    }).catch(err => {
      console.error('Failed to trigger OCR processing:', err)
      // Update document status to failed
      supabase
        .from('documents')
        .update({
          status: 'error',
          error_message: 'Failed to trigger OCR processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', doc.id)
    })

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        filename: doc.filename,
        status: doc.status,
        file_url: doc.file_url
      }
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

