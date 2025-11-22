import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import OpenAI from 'openai'

// Lazy initialization - only create client when needed
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }
  return new OpenAI({ apiKey })
}

export async function POST(req: NextRequest) {
  let documentId: string | null = null
  
  try {
    const body = await req.json()
    documentId = body.documentId

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured' },
        { status: 500 }
      )
    }

    const supabase = createAdminSupabaseClient()

    // 1. Get document from DB
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // 2. Update status to processing
    await supabase
      .from('documents')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)

    const startTime = Date.now()

    // 3. Get image URL - if bucket is private, create signed URL
    let imageUrl = doc.file_url
    
    // If the URL doesn't look like a full URL, it might be a path
    // In that case, we need to create a signed URL for private buckets
    if (!imageUrl.startsWith('http')) {
      // Extract path from storage path
      const pathMatch = imageUrl.match(/documents\/(.+)/)
      if (pathMatch) {
        const { data: signedUrlData } = await supabase
          .storage
          .from('documents')
          .createSignedUrl(pathMatch[1], 3600) // 1 hour expiry
        
        if (signedUrlData?.signedUrl) {
          imageUrl = signedUrlData.signedUrl
        }
      }
    }

    // 4. Process with GPT-4 Vision
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract ALL data from this Finnish receipt in JSON format. Return ONLY valid JSON, no other text.

Required fields:
{
  "store": "Store name (e.g., S-market, K-kauppa, Lidl, Alepa, Sale, Prisma)",
  "date": "YYYY-MM-DD",
  "total": 12.34,
  "vat": 2.34,
  "items": [
    {"name": "Item name", "price": 1.23, "quantity": 1}
  ],
  "payment_method": "Card or Cash",
  "receipt_number": "Receipt number if visible"
}

Finnish terms:
- ALV = VAT
- Yhteensä = Total
- Maksutapa = Payment method
- Kuitti = Receipt
- Päivämäärä = Date

Extract all visible information. If a field is not visible, use null.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    let ocrData: any
    try {
      // Try to extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        ocrData = JSON.parse(jsonMatch[0])
      } else {
        ocrData = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Failed to parse OCR response:', content)
      throw new Error('Invalid JSON response from OCR')
    }

    const processingTime = Date.now() - startTime

    // 5. Save results to database
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: 'completed',
        ocr_data: ocrData,
        ocr_confidence: 0.95, // GPT-4o is highly accurate
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('Failed to update document:', updateError)
      throw new Error('Failed to save OCR results')
    }

    return NextResponse.json({
      success: true,
      data: ocrData,
      processingTimeMs: processingTime
    })
  } catch (error: any) {
    console.error('OCR Error:', error)

    // Try to update document status to failed
    if (documentId) {
      try {
        const supabase = createAdminSupabaseClient()
        await supabase
          .from('documents')
          .update({
            status: 'error',
            error_message: error.message || 'OCR processing failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId)
      } catch (updateError) {
        console.error('Failed to update error status:', updateError)
      }
    }

    return NextResponse.json(
      { error: error.message || 'OCR processing failed' },
      { status: 500 }
    )
  }
}

