import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://converto.fi";
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_archived/',
          '/admin/',
          '*.json',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
