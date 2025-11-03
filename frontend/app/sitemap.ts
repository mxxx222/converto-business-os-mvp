import postsData from '../data/blog/posts.json';

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://converto.fi";
  const now = new Date();

  // Blog posts
  const blogPosts = postsData.map((post: any) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${base}/storybrand`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${base}/premium`, lastModified: now, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${base}/kiitos`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    ...blogPosts,
  ];
}
