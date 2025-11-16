/**
 * Token Refresh Endpoint (Edge Runtime)
 * Handles silent token refresh for authenticated users
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '../../_lib/response';
import * as Sentry from '@sentry/nextjs';

// Use Edge Runtime for fast token refresh
export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    if (!refreshToken) {
      return errorResponse('NO_REFRESH_TOKEN', 'Refresh token not found', null, 401);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Refresh session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      Sentry.captureMessage('Token refresh failed', {
        level: 'warning',
        extra: { error: error?.message },
      });

      return errorResponse('REFRESH_FAILED', 'Failed to refresh token', null, 401);
    }

    // Create response with new tokens
    const response = successResponse({
      access_token: data.session.access_token,
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
    });

    // Update cookies with new tokens
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    if (data.session.refresh_token) {
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 14, // 14 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'token-refresh' },
    });

    return errorResponse('INTERNAL_ERROR', 'Token refresh failed', null, 500);
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

