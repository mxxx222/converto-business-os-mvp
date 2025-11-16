/**
 * Daily Metrics Cron Job (Node.js Runtime)
 * Collects and reports daily business metrics
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '../../_lib/auth';
import { successResponse, errorResponse } from '../../_lib/response';
import * as Sentry from '@sentry/nextjs';

// Use Node.js runtime for complex operations
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return errorResponse('UNAUTHORIZED', 'Invalid cron secret', null, 401);
    }

    const startTime = Date.now();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const supabase = getSupabaseAdmin();

    // Collect metrics
    const metrics = await collectDailyMetrics(supabase, yesterdayStr);

    // Send to Sentry as custom event
    Sentry.captureMessage('Daily metrics collected', {
      level: 'info',
      tags: { 
        component: 'daily-metrics',
        date: yesterdayStr,
      },
      extra: metrics,
    });

    const duration = Date.now() - startTime;

    return successResponse({
      status: 'success',
      date: yesterdayStr,
      metrics,
      duration_ms: duration,
    });

  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'daily-metrics' },
    });

    return errorResponse('METRICS_FAILED', 'Daily metrics collection failed', null, 500);
  }
}

async function collectDailyMetrics(supabase: any, date: string) {
  // Leads created yesterday
  const { count: leadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${date}T00:00:00Z`)
    .lt('created_at', `${date}T23:59:59Z`);

  // OCR scans yesterday
  const { count: ocrCount } = await supabase
    .from('ocr_results')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${date}T00:00:00Z`)
    .lt('created_at', `${date}T23:59:59Z`);

  // Receipts processed yesterday
  const { count: receiptsCount } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${date}T00:00:00Z`)
    .lt('created_at', `${date}T23:59:59Z`);

  // Active tenants yesterday
  const { data: activeTenants } = await supabase
    .from('ocr_results')
    .select('tenant_id')
    .gte('created_at', `${date}T00:00:00Z`)
    .lt('created_at', `${date}T23:59:59Z`);

  const uniqueTenants = new Set(activeTenants?.map(t => t.tenant_id) || []).size;

  return {
    leads_created: leadsCount || 0,
    ocr_scans: ocrCount || 0,
    receipts_processed: receiptsCount || 0,
    active_tenants: uniqueTenants,
    date,
  };
}
