import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Process Document OCR function started')

interface DocumentRecord {
  id: string
  filename: string
  file_url?: string
  storage_path?: string
  status: string
  customer_name?: string
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE'
  table: string
  record: DocumentRecord
  old_record?: DocumentRecord
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: WebhookPayload = await req.json()
    const { record, type } = payload

    console.log(`Processing ${type} for document ${record.id}: ${record.filename}`)

    // Only process documents with status 'pending'
    if (record.status !== 'pending') {
      console.log(`Skipping document ${record.id} - status is ${record.status}`)
      return new Response(JSON.stringify({ message: 'Document not in pending status' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Update status to processing
    const { error: updateError } = await supabaseClient
      .from('documents')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', record.id)

    if (updateError) {
      console.error('Error updating document status:', updateError)
      throw updateError
    }

    // Log activity
    await supabaseClient.from('activities').insert({
      type: 'document.processing',
      message: `Started processing document: ${record.filename}`,
      metadata: { document_id: record.id }
    })

    // Get file from storage
    let fileBlob: Blob | null = null
    let fileUrl = record.file_url

    if (record.storage_path) {
      // Download from Supabase Storage
      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('documents')
        .download(record.storage_path)

      if (downloadError) {
        console.error('Error downloading file:', downloadError)
        throw downloadError
      }

      fileBlob = fileData
    } else if (fileUrl) {
      // Download from external URL
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch file from ${fileUrl}: ${response.status}`)
      }
      fileBlob = await response.blob()
    } else {
      throw new Error('No file_url or storage_path provided')
    }

    if (!fileBlob) {
      throw new Error('Failed to obtain file blob')
    }

    // Call OCR backend
    const ocrBackendUrl = Deno.env.get('OCR_BACKEND_URL') ?? 'https://docflow-admin-api.fly.dev'
    const ocrApiKey = Deno.env.get('OCR_BACKEND_API_KEY')

    const formData = new FormData()
    formData.append('file', fileBlob, record.filename)
    formData.append('tenant_id', 'default')

    const ocrHeaders: Record<string, string> = {}
    if (ocrApiKey) {
      ocrHeaders['Authorization'] = `Bearer ${ocrApiKey}`
    }

    console.log(`Calling OCR backend: ${ocrBackendUrl}/api/v1/documents/process`)

    const ocrResponse = await fetch(`${ocrBackendUrl}/api/v1/documents/process`, {
      method: 'POST',
      body: formData,
      headers: ocrHeaders,
    })

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text()
      console.error(`OCR backend error: ${ocrResponse.status} - ${errorText}`)
      throw new Error(`OCR processing failed: ${ocrResponse.status} - ${errorText}`)
    }

    const ocrResult = await ocrResponse.json()
    console.log('OCR result:', ocrResult)

    // Update document with OCR results
    const updateData: any = {
      status: 'completed',
      ocr_confidence: ocrResult.confidence || ocrResult.ocr_confidence,
      extracted_data: ocrResult.extracted_data || ocrResult.ocr_data,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Extract additional fields if available
    if (ocrResult.vendor) updateData.vendor = ocrResult.vendor
    if (ocrResult.total_amount) updateData.total_amount = ocrResult.total_amount
    if (ocrResult.vat_amount) updateData.vat_amount = ocrResult.vat_amount
    if (ocrResult.document_date) updateData.document_date = ocrResult.document_date

    const { error: finalUpdateError } = await supabaseClient
      .from('documents')
      .update(updateData)
      .eq('id', record.id)

    if (finalUpdateError) {
      console.error('Error updating document with OCR results:', finalUpdateError)
      throw finalUpdateError
    }

    // Log successful completion
    await supabaseClient.from('activities').insert({
      type: 'document.completed',
      message: `Successfully processed document: ${record.filename}`,
      metadata: {
        document_id: record.id,
        confidence: ocrResult.confidence || ocrResult.ocr_confidence
      }
    })

    console.log(`Successfully processed document ${record.id}`)

    return new Response(JSON.stringify({
      message: 'Document processed successfully',
      document_id: record.id,
      confidence: ocrResult.confidence || ocrResult.ocr_confidence
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error processing document:', error)

    // Try to update document status to error
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const payload: WebhookPayload = await req.json()
      const { record } = payload

      await supabaseClient
        .from('documents')
        .update({
          status: 'error',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id)

      // Log error
      await supabaseClient.from('activities').insert({
        type: 'document.failed',
        message: `Failed to process document: ${record.filename} - ${error.message}`,
        metadata: { document_id: record.id, error: error.message }
      })
    } catch (logError) {
      console.error('Error logging failure:', logError)
    }

    return new Response(JSON.stringify({
      error: 'Failed to process document',
      message: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})