import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import postsData from '@/data/blog/posts.json';
import '../styles.css';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return postsData.map((post: any) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = postsData.find((p: any) => p.slug === slug);

  if (!post) {
    return {
      title: 'Artikkelia ei löytynyt',
    };
  }

  return {
    title: `${post.title} | Converto Blogi`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://converto.fi/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = postsData.find((p: any) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // For now, we'll use a simple content structure
  // In production, you'd load markdown files and render them
  const content = `
    <div class="prose-content">
      <h1>${post.title}</h1>
      <p class="lead text-xl text-gray-600 mb-8">${post.excerpt}</p>

      <div class="space-y-6">
        <section>
          <h2>Johdanto</h2>
          <p>Tämä on esimerkki-blogiartikkeli. Sisältö voidaan ladata markdown-tiedostoista tai tietokannasta.</p>
        </section>

        <section>
          <h2>Päällimmäiset hyödyt</h2>
          <ul>
            <li>Automaatio säästää aikaa merkittävästi</li>
            <li>Vähentää virheitä jopa 95%</li>
            <li>Skaalautuu ilman lisähenkilöstöä</li>
            <li>Parantaa työnlaatua</li>
          </ul>
        </section>

        <section>
          <h2>Yhteenveto</h2>
          <p>Automaatio on investointi joka maksaa itsensä takaisin nopeasti. Aloita pienenä ja kasva tarpeen mukaan.</p>
        </section>
      </div>
    </div>
  `;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/blog"
            className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-4"
          >
            ← Takaisin blogiin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              {post.category}
            </span>
            {post.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 text-gray-600 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{post.author.avatar}</span>
              <span className="font-medium">{post.author.name}</span>
            </div>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('fi-FI', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <span>•</span>
            <span>{post.readTime} lukuaika</span>
          </div>
        </header>

        {/* Article Content */}
        <article
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-12 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tagit:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Posts */}
        <section className="mb-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Muut artikkelit
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {postsData
              .filter((p: any) => p.slug !== slug)
              .slice(0, 2)
              .map((relatedPost: any) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                </Link>
              ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Valmis automatisoida yrityksesi?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Aloita ilmainen 14 päivän kokeilu ja näe tulokset ensimmäisten päivien aikana.
          </p>
          <Link
            href="/premium"
            className="inline-block bg-white text-purple-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Aloita ilmaiseksi nyt →
          </Link>
        </section>
      </main>
    </div>
  );
}
