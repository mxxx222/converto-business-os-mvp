// This file makes use of @sentry/nextjs to provide both an instrumentation file and
// configuration for the SDK and any other related tooling.
const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'docflow.fi',
      'www.docflow.fi',
      'converto.fi',
      'supabase.co'
    ]
  },
  assetPrefix: process.env.ASSET_PREFIX || '',
  trailingSlash: false
};

// Sentry config options
const isSentryEnabled = !!process.env.SENTRY_DSN;

if (isSentryEnabled) {
  console.log("🔍 Sentry monitoring enabled");
}

const sentryWebpackPluginOptions = {
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: false,

  // Uncomment to get tunneled uploads during development
  tunnelRoute: "/monitoring",

  // Only build Pages and API routes
  // hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
