/**
 * Receipt Scanning Endpoint (Node.js Runtime)
 * Scans and extracts data from receipt images
 * Migrated from: shared_core/modules/receipts/router.py
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '../../_lib/auth';
import { getSupabaseWithRLS } from '../../_lib/db';
import { successResponse, handleAPIError, createdResponse } from '../../_lib/response';
import { captureAPIError, measurePerformance } from '../../_lib/sentry';
import { setTenantContext } from '../../_lib/tenant';
import * as Sentry from '@sentry/nextjs';

// Use Node.js runtime for file processing
export const runtime = 'nodejs';
export const maxDuration = 60;

interface ReceiptData {
  id: string;
  vendor: string;
  total_amount: number;
  vat_amount: number;
  vat_rate: number;
  net_amount: number;
  receipt_date: string;
  invoice_number?: string;
  payment_method?: string;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  category: string;
  subcategory?: string;
  tags: string[];
  confidence: number;
  status: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    setTenantContext(user);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return handleAPIError(new Error('File is required'));
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return handleAPIError(new Error('Invalid file type. Only images are allowed.'));
    }

    // Process receipt
    const result = await measurePerformance(
      'receipt-scanning',
      async () => await processReceipt(file, user.tenant_id),
      user
    );

    // Store in Supabase
    const client = await getSupabaseWithRLS(user);
    
    const { data: savedReceipt, error: saveError } = await client
      .from('receipts')
      .insert({
        tenant_id: user.tenant_id,
        vendor: result.data.vendor,
        total_amount: result.data.total_amount,
        vat_amount: result.data.vat_amount,
        vat_rate: result.data.vat_rate,
        net_amount: result.data.net_amount,
        receipt_date: result.data.receipt_date,
        invoice_number: result.data.invoice_number,
        payment_method: result.data.payment_method,
        currency: result.data.currency,
        items: result.data.items,
        category: result.data.category,
        subcategory: result.data.subcategory,
        tags: result.data.tags,
        confidence: result.data.confidence,
        status: result.data.status,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      Sentry.captureException(saveError, {
        tags: { component: 'receipt-save', tenant_id: user.tenant_id },
      });
      throw saveError;
    }

    return createdResponse({
      success: true,
      receipt_id: savedReceipt.id,
      data: result.data,
      vision_ai: result.vision_ai,
      file_info: result.file_info,
    });

  } catch (error) {
    captureAPIError(error, request);
    return handleAPIError(error);
  }
}

/**
 * Process receipt image
 * In production, this would call OCR/Vision AI service
 */
async function processReceipt(
  file: File,
  tenantId: string
): Promise<{
  data: ReceiptData;
  vision_ai: any;
  file_info: any;
}> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const size = buffer.length;

  // TODO: Call actual OCR/Vision AI service
  // For now, return mock data
  // In production:
  // 1. Upload to Supabase Storage
  // 2. Call Vision AI (Google Cloud Vision, AWS Textract, Azure Form Recognizer)
  // 3. Parse structured data
  // 4. Validate and return

  const receiptId = `rcpt_${Date.now()}`;
  
  const data: ReceiptData = {
    id: receiptId,
    vendor: 'Mock Vendor',
    total_amount: 42.50,
    vat_amount: 10.20,
    vat_rate: 24,
    net_amount: 32.30,
    receipt_date: new Date().toISOString().split('T')[0],
    invoice_number: null,
    payment_method: 'card',
    currency: 'EUR',
    items: [
      {
        description: 'Mock Item 1',
        quantity: 2,
        unit_price: 15.00,
        total: 30.00,
      },
      {
        description: 'Mock Item 2',
        quantity: 1,
        unit_price: 12.50,
        total: 12.50,
      },
    ],
    category: 'office_supplies',
    subcategory: 'stationery',
    tags: ['business', 'deductible'],
    confidence: 0.85,
    status: 'processed',
  };

  return {
    data,
    vision_ai: {
      model: 'mock-vision-v1',
      processing_time_ms: 250,
      confidence: 0.85,
    },
    file_info: {
      name: file.name,
      size,
      content_type: file.type,
    },
  };
}

// GET endpoint to list receipts
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    setTenantContext(user);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const client = await getSupabaseWithRLS(user);

    const { data, error, count } = await client
      .from('receipts')
      .select('*', { count: 'exact' })
      .order('receipt_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return successResponse({
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
    });

  } catch (error) {
    captureAPIError(error, request);
    return handleAPIError(error);
  }
}

