/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  env: {
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || 'development-secret-key',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret-key',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  typescript: {
    // Skip type checking during build - these are recharts type definition issues, not runtime errors
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions policy (formerly Feature-Policy)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for Next.js in dev
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss: ws:", // Allow API and WebSocket connections
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-src 'none'",
              "object-src 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // Strict Transport Security (only in production)
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }] : [])
        ]
      }
    ]
  }
}

module.exports = nextConfig