/**
 * OCR Power Analysis Endpoint (Node.js Runtime)
 * Analyzes device power consumption from images
 * Migrated from: shared_core/modules/ocr/router.py
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '../../_lib/auth';
import { getSupabaseWithRLS, insert } from '../../_lib/db';
import { successResponse, handleAPIError, createdResponse } from '../../_lib/response';
import { captureAPIError, measurePerformance } from '../../_lib/sentry';
import { setTenantContext } from '../../_lib/tenant';
import * as Sentry from '@sentry/nextjs';

// Use Node.js runtime for file processing
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for OCR processing

interface OCRResult {
  id: string;
  tenant_id: string;
  device_type?: string;
  brand_model?: string;
  rated_watts?: number;
  wh: number;
  confidence: number;
  analysis: any;
  recommended_bundle?: any;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    setTenantContext(user);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const deviceHint = formData.get('device_hint') as string | null;
    const hours = parseFloat(formData.get('hours') as string || '1.0');
    
    if (!file) {
      return handleAPIError(new Error('File is required'));
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return handleAPIError(new Error('Invalid file type. Only images are allowed.'));
    }

    // Process OCR
    const result = await measurePerformance(
      'ocr-processing',
      async () => await processOCR(file, deviceHint, hours, user.tenant_id),
      user
    );

    // Store result in Supabase
    const client = await getSupabaseWithRLS(user);
    
    const { data: savedResult, error: saveError } = await client
      .from('ocr_results')
      .insert({
        tenant_id: user.tenant_id,
        device_type: result.analysis.device_type,
        brand_model: result.analysis.brand_model,
        rated_watts: result.analysis.rated_watts,
        wh: result.wh,
        confidence: result.analysis.confidence || 0.5,
        raw_data: result.analysis,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      Sentry.captureException(saveError, {
        tags: { component: 'ocr-save', tenant_id: user.tenant_id },
      });
      throw saveError;
    }

    // Gamification: Award points for OCR scan
    try {
      await awardGamificationPoints(client, user.tenant_id, savedResult.id);
    } catch (gamifyError) {
      // Non-critical error, log but don't fail request
      Sentry.captureException(gamifyError, {
        level: 'warning',
        tags: { component: 'gamification' },
      });
    }

    return createdResponse({
      id: savedResult.id,
      ...result,
    });

  } catch (error) {
    captureAPIError(error, request);
    return handleAPIError(error);
  }
}

/**
 * Process OCR on uploaded image
 * This is a simplified version - in production, this would call:
 * 1. Supabase Edge Function for OCR
 * 2. External OCR service (Google Vision, AWS Textract)
 * 3. Python microservice for complex ML
 */
async function processOCR(
  file: File,
  deviceHint: string | null,
  hours: number,
  tenantId: string
): Promise<{
  input_hours: number;
  wh: number;
  analysis: any;
  recommended_bundle?: any;
}> {
  // Convert file to buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // TODO: Call actual OCR service
  // For now, return mock data structure
  // In production, this would:
  // 1. Upload to Supabase Storage
  // 2. Call Edge Function or external OCR API
  // 3. Parse power rating from text
  // 4. Return structured data

  const mockAnalysis = {
    device_type: deviceHint || 'unknown',
    brand_model: 'Mock Device',
    rated_watts: 100, // This would come from OCR
    confidence: 0.8,
    ocr_raw: 'Mock OCR text',
  };

  const wh = Math.max(hours, 0.1) * mockAnalysis.rated_watts;

  // Recommend bundle based on wh
  const bundle = recommendBundle(wh);

  return {
    input_hours: hours,
    wh,
    analysis: mockAnalysis,
    recommended_bundle: bundle,
  };
}

/**
 * Recommend power bundle based on watt-hours
 */
function recommendBundle(wh: number): any {
  if (wh < 500) {
    return { name: 'Small', capacity: '500Wh', price: 299 };
  } else if (wh < 1000) {
    return { name: 'Medium', capacity: '1000Wh', price: 499 };
  } else if (wh < 2000) {
    return { name: 'Large', capacity: '2000Wh', price: 799 };
  } else {
    return { name: 'XL', capacity: '3000Wh', price: 1199 };
  }
}

/**
 * Award gamification points for OCR scan
 */
async function awardGamificationPoints(
  client: any,
  tenantId: string,
  resultId: string
): Promise<void> {
  // Record gamification event
  await client.from('gamify_events').insert({
    tenant_id: tenantId,
    event_type: 'ocr.success',
    points: 5,
    metadata: { result_id: resultId },
    created_at: new Date().toISOString(),
  });

  // Mint P2E tokens
  await client.from('p2e_token_ledger').insert({
    tenant_id: tenantId,
    user_id: 'user_demo', // TODO: Get from auth context
    amount: 5,
    reason: 'ocr_success',
    ref_id: resultId,
    created_at: new Date().toISOString(),
  });
}

// GET endpoint to list OCR results
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    setTenantContext(user);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const client = await getSupabaseWithRLS(user);

    const { data, error, count } = await client
      .from('ocr_results')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
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

