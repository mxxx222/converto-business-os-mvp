/**
 * Lead Management Endpoint (Edge Runtime)
 * Handles lead creation with GDPR consent
 * Migrated from: backend/app/routes/leads.py
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '../_lib/auth';
import { successResponse, handleAPIError, validationErrorResponse } from '../_lib/response';
import { captureAPIError, captureEvent } from '../_lib/sentry';
import * as Sentry from '@sentry/nextjs';

// Use Edge Runtime for fast lead capture
export const runtime = 'edge';

interface LeadCreate {
  email: string;
  company?: string;
  name?: string;
  phone?: string;
  note?: string;
  consent: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadCreate = await request.json();

    // Validation
    const errors = validateLead(body);
    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Check GDPR consent
    if (!body.consent) {
      captureEvent('Lead creation failed: No consent', 'warning');
      return validationErrorResponse([{
        field: 'consent',
        message: 'GDPR consent is required',
        code: 'CONSENT_REQUIRED',
      }]);
    }

    // Save lead to Supabase
    const supabase = getSupabaseAdmin();
    
    const { data: lead, error: saveError } = await supabase
      .from('leads')
      .insert({
        email: body.email,
        company: body.company,
        name: body.name,
        phone: body.phone,
        note: body.note,
        consent: body.consent,
        source: 'website',
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      Sentry.captureException(saveError, {
        tags: { component: 'lead-creation' },
      });
      throw saveError;
    }

    // Capture success event
    captureEvent('Lead created successfully', 'info', null, {
      lead_id: lead.id,
      has_company: !!body.company,
    });

    // TODO: Trigger email notification via Resend
    // await sendLeadNotification(lead);

    return successResponse({
      ok: true,
      lead_id: lead.id,
    }, undefined, 201);

  } catch (error) {
    captureAPIError(error, request);
    captureEvent('Lead creation error', 'error', null, {
      error: error instanceof Error ? error.message : String(error),
    });
    return handleAPIError(error);
  }
}

/**
 * Validate lead data
 */
function validateLead(lead: LeadCreate): Array<{
  field: string;
  message: string;
  code: string;
}> {
  const errors: Array<{ field: string; message: string; code: string }> = [];

  // Email validation
  if (!lead.email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
      code: 'EMAIL_REQUIRED',
    });
  } else if (!isValidEmail(lead.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'EMAIL_INVALID',
    });
  }

  // Consent validation
  if (typeof lead.consent !== 'boolean') {
    errors.push({
      field: 'consent',
      message: 'Consent must be a boolean',
      code: 'CONSENT_INVALID',
    });
  }

  return errors;
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// GET endpoint to list leads (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication
    // const user = await requireRole(request, ['admin', 'support']);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

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

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

