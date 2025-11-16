import { MetadataRoute } from 'next';
import { generateSitemap } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemap();
}