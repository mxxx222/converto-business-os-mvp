/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  i18n: {
    locales: ['fi', 'en'],
    defaultLocale: 'fi',
    localeDetection: false,
  },
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
