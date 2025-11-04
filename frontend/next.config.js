/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'strict-dynamic'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Strict-Transport-Security', value: 'max-age=15552000; includeSubDomains' },
];

// Conditional export: static for marketing site, SSR for dashboard
// Dashboard REQUIRES SSR for Tailwind CSS and Supabase
// Only enable static export when explicitly set to 'true'
const enrolledStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // Only use static export for marketing site (premium, kiitos pages)
  // Dashboard requires SSR for middleware and Supabase auth
  ...(enrolledStaticExport && {
    output: 'export',
    distDir: 'out',
  }),
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86_400,
    domains: ['cdn.converto.app', 'assets.stripe.com', 'images.unsplash.com', 'via.placeholder.com'],
  },
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/premium',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/app/dashboard',
        permanent: true,
      },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Headers only work in SSR mode (not in static export)
  ...(!enrolledStaticExport && {
    async headers() {
      return [
        { source: '/(.*)', headers: securityHeaders },
        {
          source: '/sw.js',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
        },
        {
          source: '/manifest.json',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
        },
        {
          source: '/icon-:path*',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
        },
      ];
    },
  }),
};

// Wrap Next.js config with Sentry
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
