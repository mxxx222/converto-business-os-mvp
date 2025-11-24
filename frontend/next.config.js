/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Note: i18n is not compatible with App Router - use middleware for locale handling instead
  experimental: {
    optimizePackageImports: ['lucide-react'],
    isrMemoryCacheSize: 0,
  },
  images: {
    formats: ['image/avif', 'image/webp']
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.docflow.fi',
          },
        ],
        destination: 'https://docflow.fi/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
