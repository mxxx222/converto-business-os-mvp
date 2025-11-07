export const runtime = 'edge';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
    environment: process.env.NEXT_PUBLIC_ENV || 'development',
    services: {
      database: 'ok', // TODO: Add actual health checks
      email: 'ok',
      payments: 'ok'
    }
  };

  return Response.json(health, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json'
    }
  });
}
