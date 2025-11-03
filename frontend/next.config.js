/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://*.plausible.io",
      "script-src-elem 'self' 'unsafe-inline' https://plausible.io https://*.plausible.io",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://plausible.io https://*.plausible.io https://api.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '),
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
  // PRODUCTION: Enable SWC minification
  swcMinify: true,
  // PRODUCTION: Enable compression
  compress: true,
  // Only use static export for marketing site (premium, kiitos pages)
  // Dashboard requires SSR for middleware and Supabase auth
  ...(enrolledStaticExport && {
    output: 'export',
    distDir: 'out',
  }),
  // PRODUCTION: Package import optimization
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'lucide-react',
      '@supabase/supabase-js',
    ],
  },
  // Rewrites for subdomain routing (pilot.converto.fi)
  async rewrites() {
    return [
      {
        source: '/pilot',
        destination: '/pilot',
      },
    ];
  },
  // PRODUCTION: Redirects for legacy routes
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/app/dashboard',
        permanent: true,
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
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    }),
    minimumCacheTTL: 86_400,
    domains: [
      'cdn.converto.app',
      'cdn.converto.fi', // Cloudflare R2 custom domain
      'supabase-cdn.com',
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
        // PRODUCTION: API route caching
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=60, s-maxage=120',
            },
          ],
        },
        // PRODUCTION: Static assets caching
        {
          source: '/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        // PRODUCTION: Performance headers
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on',
            },
            {
              key: 'X-Process-Time',
              value: '0',
            },
          ],
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
