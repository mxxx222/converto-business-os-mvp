import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://docflow.fi';
  return { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${base}/sitemap.xml` };
}
