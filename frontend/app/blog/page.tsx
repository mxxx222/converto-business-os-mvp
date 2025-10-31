import { Metadata } from 'next';
import Link from 'next/link';
import postsData from '../../data/blog/posts.json';
import './styles.css';

export const metadata: Metadata = {
  title: 'Blogi | Converto Business OS',
  description: 'Automaatio, teknologi ja liiketoiminnan kehitys. Oppaat, vinkit ja uutiset Converto Business OS:sta.',
  openGraph: {
    title: 'Blogi | Converto Business OS',
    description: 'Automaatio, teknologi ja liiketoiminnan kehitys.',
    url: 'https://converto.fi/blog',
  },
};

export default function BlogPage() {
  const featuredPosts = postsData.filter((post: any) => post.featured);
  const regularPosts = postsData.filter((post: any) => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Link 
            href="/premium" 
            className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-4"
          >
            ← Takaisin etusivulle
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Converto Blogi
          </h1>
          <p className="text-xl text-gray-600">
            Automaatio, teknologi ja liiketoiminnan kehitys
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Suositellut artikkelit
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post: any) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-6xl">{post.image ? '📄' : '📝'}</span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{post.author.avatar}</span>
                          <span className="text-sm text-gray-600">{post.author.name}</span>
                        </div>
                        <time className="text-sm text-gray-500">
                          {new Date(post.publishedAt).toLocaleDateString('fi-FI', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Kaikki artikkelit
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsData.map((post: any) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-6xl">{post.image ? '📄' : '📝'}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{post.author.avatar}</span>
                        <span className="text-sm text-gray-600">{post.author.name}</span>
                      </div>
                      <time className="text-sm text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString('fi-FI', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </time>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
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

