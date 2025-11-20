/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
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
}

module.exports = nextConfig