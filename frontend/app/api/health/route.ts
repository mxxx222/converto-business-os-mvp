/**
 * Health Check Endpoint (Edge Runtime)
 * Fast health check for load balancers and monitoring
 */

import { NextRequest } from 'next/server';
import { successResponse } from '../_lib/response';

// Use Edge Runtime for lowest latency
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_ENV || 'development',
    region: process.env.VERCEL_REGION || 'local',
  });
}

