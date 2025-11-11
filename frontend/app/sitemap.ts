import type { MetadataRoute } from 'next';

const baseUrl = 'https://docflow.fi';

const routes = [
  '/',
  '/fi',
  '/en',
  '/fi/pricing',
  '/fi/demo',
  '/fi/signup',
  '/fi/contact',
  '/en/pricing',
  '/en/demo',
  '/en/signup',
  '/en/contact',
  '/fi/security',
  '/en/security',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    changefreq: 'weekly',
    priority: path === '/' || path === '/fi' ? 1 : 0.6,
  }));
}

