/**
 * Supabase client for Next.js Middleware.
 * Refreshes session tokens and handles auth state.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          domain: '.converto.fi', // Shared cookie domain for all subdomains
          ...options,
        });
        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        supabaseResponse.cookies.set({
          name,
          value,
          domain: '.converto.fi',
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          domain: '.converto.fi',
          ...options,
        });
        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        supabaseResponse.cookies.set({
          name,
          value: '',
          domain: '.converto.fi',
          ...options,
        });
      },
    },
  });

  // Refresh session if expired
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Protected routes: /app/* (dashboard, settings, etc.)
  const protectedPaths = ['/app/dashboard', '/app/settings', '/app/reports', '/app/receipts', '/app/insights'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Allow /app/login to be accessible without auth
  if (request.nextUrl.pathname === '/app/login' || request.nextUrl.pathname === '/app') {
    // If user is logged in and tries to access login, redirect to dashboard
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = '/app/dashboard';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Redirect to login if accessing protected route without auth
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/app/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Legacy /dashboard redirect to /app/dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && !request.nextUrl.pathname.startsWith('/app')) {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname.replace('/dashboard', '/app/dashboard');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
