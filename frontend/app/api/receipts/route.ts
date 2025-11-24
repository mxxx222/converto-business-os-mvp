/**
 * Receipts API Route
 * Handles saving processed receipts to the database
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '../_lib/auth';
import { getSupabaseWithRLS } from '../_lib/db';
import { successResponse, handleAPIError, createdResponse } from '../_lib/response';
import { captureAPIError } from '../_lib/sentry';
import { setTenantContext } from '../_lib/tenant';

export const runtime = 'nodejs';

interface ReceiptSaveRequest {
  id?: string;
  vendor_name: string;
  business_id?: string;
  date: string;
  total_amount: number;
  vat_rate: number;
  vat_amount: number;
  net_amount: number;
  category: string;
  image_url?: string;
  user_id?: string;
  approved_at?: string;
  confidence?: number;
  explanation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    setTenantContext(user);

    const body: ReceiptSaveRequest = await request.json();

    const client = await getSupabaseWithRLS(user);

    // Transform to match receipts table schema
    const receiptData = {
      tenant_id: user.tenant_id,
      vendor: body.vendor_name,
      total_amount: body.total_amount,
      vat_amount: body.vat_amount,
      vat_rate: body.vat_rate,
      net_amount: body.net_amount,
      receipt_date: body.date,
      invoice_number: body.business_id,
      currency: 'EUR',
      items: [],
      category: body.category,
      subcategory: null,
      tags: [],
      confidence: body.confidence ? body.confidence / 100 : 0.85,
      status: 'processed',
      created_at: new Date().toISOString(),
    };

    const { data: savedReceipt, error: saveError } = await client
      .from('receipts')
      .insert(receiptData)
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    return createdResponse({
      success: true,
      receipt_id: savedReceipt.id,
      data: savedReceipt,
    });

  } catch (error) {
    captureAPIError(error, request);
    return handleAPIError(error);
  }
}

