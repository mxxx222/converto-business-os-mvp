const nextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ["clsx"] },
  async headers() {
    const backendReportUrl = 'https://converto-business-os-quantum-mvp-1.onrender.com/csp/report';
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
      "report-to csp-endpoint",
      `report-uri ${backendReportUrl}`,
    ].join('; ');
    const reportTo = {
      group: 'csp-endpoint',
      max_age: 10886400,
      endpoints: [{ url: backendReportUrl }],
    };

    const securityHeaders = [
      { key: 'Content-Security-Policy-Report-Only', value: csp },
      { key: 'Report-To', value: JSON.stringify(reportTo) },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Strict-Transport-Security', value: 'max-age=15552000; includeSubDomains' },
    ];

    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          ...securityHeaders,
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
      '@content': require('path').resolve(__dirname, './content'),
    };
    return config;
  },
};

module.exports = nextConfig;
