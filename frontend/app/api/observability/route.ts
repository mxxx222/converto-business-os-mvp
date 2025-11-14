import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { timed } from '@/app/api/_utils/timed';
import { OCR_DURATION } from '@/lib/obs/metrics';
import { withSentryContext } from '@/lib/obs/sentry-server';

export const runtime = 'nodejs';
export const revalidate = 0;

export const GET = withSentryContext(async (req: Request) => {
  return timed(req, '/api/observability', async () => {
    Sentry.captureMessage('obs_smoke_test', { level: 'info' });
    OCR_DURATION.labels('demo', 'smoke', 'ok').observe(0.4);

    return NextResponse.json({
      ok: true,
      message: 'Observability pipeline healthy'
    });
  });
});
