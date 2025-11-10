import type { MetadataRoute } from 'next';

const BASE_URL = 'https://docflow.fi';
const LANGUAGES: readonly string[] = ['fi', 'en'];

const PATHS = ['', '/pricing', '/contact', '/security', '/privacy'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PATHS.flatMap((path) => {
    const isRoot = path === '';
    const baseEntry: MetadataRoute.Sitemap[number] = {
      url: `${BASE_URL}${path}`,
      lastModified,
      changeFrequency: isRoot ? 'weekly' : 'monthly',
      priority: isRoot ? 1 : 0.8,
    };

    const localizedEntries = LANGUAGES.map<MetadataRoute.Sitemap[number]>((lang) => ({
      url: `${BASE_URL}/${lang}${path}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [baseEntry, ...localizedEntries];
  });
}