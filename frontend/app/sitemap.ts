export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://converto.fi";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/premium`, lastModified: now },
    { url: `${base}/kiitos`, lastModified: now },
  ];
}
