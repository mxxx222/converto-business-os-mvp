export const runtime = 'edge';

export function GET() {
  const isProd = process.env.NEXT_PUBLIC_ENV === 'production';
  const body = isProd
    ? `User-agent: *\nAllow: /\nSitemap: https://docflow.fi/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
