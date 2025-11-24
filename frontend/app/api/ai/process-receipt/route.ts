/**
 * AI Receipt Processing Endpoint
 * Processes base64-encoded receipt images and returns structured data
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../_lib/auth';
import { setTenantContext } from '../../_lib/tenant';
import { handleAPIError, successResponse } from '../../_lib/response';
import { captureAPIError } from '../../_lib/sentry';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ProcessReceiptRequest {
  image_base64: string;
  user_id?: string;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    setTenantContext(user);

    const body: ProcessReceiptRequest = await request.json();
    const { image_base64, language = 'fi' } = body;

    if (!image_base64) {
      return NextResponse.json(
        { error: 'image_base64 is required' },
        { status: 400 }
      );
    }

    // Convert base64 to Buffer
    const imageBuffer = Buffer.from(image_base64, 'base64');
    
    // Create a File-like object for the existing receipt scan endpoint
    const file = new File([imageBuffer], 'receipt.jpg', { type: 'image/jpeg' });

    // Call the existing receipt scan endpoint using internal API call
    const formData = new FormData();
    formData.append('file', file);

    // Create a new request for the internal API call
    const internalRequest = new Request(`${request.nextUrl.origin}/api/receipts/scan`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: formData,
    });

    // Import the scan handler directly to avoid HTTP overhead
    // For now, we'll simulate the processing inline
    // TODO: Extract receipt processing logic to a shared module
    
    // Mock processing for now - in production this would use actual OCR
    const receiptId = `rcpt_${Date.now()}`;
    const scanResult = {
      success: true,
      receipt_id: receiptId,
      data: {
        id: receiptId,
        vendor: 'Tuntematon',
        total_amount: 0.0,
        vat_amount: 0.0,
        vat_rate: 24,
        net_amount: 0.0,
        receipt_date: new Date().toISOString().split('T')[0],
        category: 'other',
        confidence: 0.75,
      },
    };

    // Transform the result to match the expected AIResult format
    const receiptData = scanResult.data || scanResult;
    
    // Calculate confidence and auto-approve threshold
    const confidence = receiptData.confidence || 0.85;
    const auto_approve_threshold = 85; // Default threshold

    // Transform to AIResult format
    const aiResult = {
      id: receiptData.id || scanResult.receipt_id || `rcpt_${Date.now()}`,
      vendor_name: receiptData.vendor || 'Tuntematon',
      business_id: receiptData.business_id,
      date: receiptData.receipt_date || new Date().toISOString().split('T')[0],
      total_amount: receiptData.total_amount || 0,
      vat_rate: receiptData.vat_rate || 24,
      vat_amount: receiptData.vat_amount || 0,
      net_amount: receiptData.net_amount || 0,
      category: receiptData.category || 'other',
      confidence: confidence * 100, // Convert to percentage
      auto_approve_threshold,
      is_known_vendor: false, // TODO: Implement vendor recognition
      pattern_matches: 0,
      explanation: `Kuitti käsitelty ${language === 'fi' ? 'onnistuneesti' : 'successfully'}. ${confidence >= 0.85 ? 'Korkea luottamus' : 'Tarkista tiedot'}.`,
      predicted_category: receiptData.category,
    };

    return successResponse(aiResult);

  } catch (error) {
    captureAPIError(error, request);
    return handleAPIError(error);
  }
}

