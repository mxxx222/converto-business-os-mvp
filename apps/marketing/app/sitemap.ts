import { MetadataRoute } from 'next';

const routes = [
  '/',
  '/pricing',
  '/features',
  '/integrations',
  '/security',
  '/contact',
  '/demo',
  '/signup',
  '/thanks',
  '/legal/privacy',
  '/legal/dpa',
  '/en',
  '/en/pricing',
  '/en/integrations',
  '/en/security',
  '/en/legal/privacy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://docflow.fi';
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.6,
  }));
}
