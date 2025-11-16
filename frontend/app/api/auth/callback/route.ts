/**
 * Supabase Auth Callback (Edge Runtime)
 * Handles OAuth and magic link callbacks
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

// Use Edge Runtime for fast auth redirects
export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const error_description = requestUrl.searchParams.get('error_description');

    // Handle auth errors
    if (error) {
      Sentry.captureMessage(`Auth callback error: ${error}`, {
        level: 'warning',
        extra: { error_description },
      });

      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
      );
    }

    // Exchange code for session
    if (code) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        Sentry.captureException(exchangeError, {
          tags: { component: 'auth-callback' },
        });

        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, requestUrl.origin)
        );
      }

      // Successful authentication
      if (data.session) {
        // Set cookies
        const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin));

        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 15, // 15 minutes
          path: '/',
        });

        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 14, // 14 days
          path: '/',
        });

        return response;
      }
    }

    // No code provided - redirect to login
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'auth-callback' },
    });

    return NextResponse.redirect(
      new URL('/login?error=unexpected_error', request.url)
    );
  }
}

