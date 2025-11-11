import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is trying to access protected routes
  if (request.nextUrl.pathname.startsWith('/app') || 
      request.nextUrl.pathname === '/' ||
      (request.nextUrl.pathname !== '/login' && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/api'))) {
    
    // Check for admin token
    const adminToken = request.cookies.get('admin_token') || request.headers.get('authorization')
    
    // Allow access to login page and public assets
    if (request.nextUrl.pathname === '/login' || 
        request.nextUrl.pathname.startsWith('/_next') || 
        request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.next()
    }
    
    // Redirect to login if no valid token
    if (!adminToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}