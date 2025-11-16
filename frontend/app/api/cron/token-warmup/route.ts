/**
 * Token Warmup Cron Job (Edge Runtime)
 * Keeps Supabase connections warm and validates auth tokens
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '../../_lib/auth';
import { successResponse, errorResponse } from '../../_lib/response';
import * as Sentry from '@sentry/nextjs';

// Use Edge Runtime for cron jobs
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse('UNAUTHORIZED', 'Invalid cron secret', null, 401);
    }

    const startTime = Date.now();

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceRole) {
      return successResponse({
        status: 'skipped',
        reason: 'Supabase not configured',
        timestamp: new Date().toISOString(),
      });
    }

    // Warm up Supabase connection
    const supabase = getSupabaseAdmin();
    
    // Simple query to keep connection alive
    const { data, error } = await supabase
      .from('leads')
      .select('count')
      .limit(1);

    if (error) {
      Sentry.captureException(error, {
        tags: { component: 'token-warmup' },
      });
      throw error;
    }

    const duration = Date.now() - startTime;

    // Log success
    Sentry.captureMessage('Token warmup completed', {
      level: 'info',
      tags: { component: 'cron-warmup' },
      extra: { duration_ms: duration },
    });

    return successResponse({
      status: 'success',
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'token-warmup' },
    });

    return errorResponse('WARMUP_FAILED', 'Token warmup failed', null, 500);
  }
}
