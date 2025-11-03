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
  // Rewrites for subdomain routing (pilot.converto.fi)
  async rewrites() {
    return [
      {
        source: '/pilot',
        destination: '/pilot',
      },
    ];
  },
  images: {
    // OPTIMIZED: Use Cloudflare Image Optimization if enabled
    ...(process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_ENABLED === 'true' && {
      loader: 'cloudflare',
      loaderFile: './lib/cloudflare-image-loader.js',
    }),
    // Fallback: Next.js default optimization
    ...(process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_ENABLED !== 'true' && {
      unoptimized: false,
      formats: ['image/avif', 'image/webp'],
    }),
    minimumCacheTTL: 86_400,
    domains: [
      'cdn.converto.app',
      'cdn.converto.fi', // Cloudflare R2 custom domain
      'assets.stripe.com',
      'images.unsplash.com',
      'via.placeholder.com',
    ],
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
