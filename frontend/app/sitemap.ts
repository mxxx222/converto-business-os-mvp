import type { MetadataRoute } from 'next';

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://docflow.fi';
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/integrations`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/security`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/demo`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/legal/dpa`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 }
  ];
}
