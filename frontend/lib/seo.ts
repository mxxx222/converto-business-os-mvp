import { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

const defaultSEO: SEOConfig = {
  title: 'DocFlow - Automatisoi laskut ja kuitit 97% tarkkuudella | Säästä €20k/vuosi',
  description: 'DocFlow automatisoi ostolaskujen ja kuittien käsittelyn 97% tarkkuudella. Integraatiot Netvisoriin ja Procountoriin. Säästä €20 000/vuosi. 30 päivää ilmaiseksi.',
  keywords: [
    'laskujen automaatio',
    'OCR suomi',
    'taloushallinto',
    'netvisor integraatio',
    'procountor integraatio',
    'kuittien käsittely',
    'ALV automaatio',
    'pk-yritys',
    'digitalisaatio',
    'tekoäly taloushallinto'
  ],
  ogImage: '/api/og?title=DocFlow%20-%20Automaatio,%20joka%20kasvattaa%20kassavirtaa'
};

export function generateMetadata(config: Partial<SEOConfig> = {}): Metadata {
  const seo = { ...defaultSEO, ...config };
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords?.join(', '),
    
    // Open Graph
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonicalUrl,
      siteName: 'DocFlow',
      images: seo.ogImage ? [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: seo.title
        }
      ] : undefined,
      locale: 'fi_FI',
      type: 'website'
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
      creator: '@docflow_fi'
    },
    
    // Additional meta tags
    robots: seo.noIndex ? 'noindex,nofollow' : 'index,follow',
    
    // Language and locale
    alternates: {
      canonical: seo.canonicalUrl,
      languages: {
        'fi-FI': seo.canonicalUrl,
        'en-US': seo.canonicalUrl?.replace('/fi/', '/en/')
      }
    }
  };
}

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: 'DocFlow - Automatisoi laskut ja kuitit 97% tarkkuudella | Säästä €20k/vuosi',
    description: 'DocFlow automatisoi ostolaskujen ja kuittien käsittelyn 97% tarkkuudella. Integraatiot Netvisoriin ja Procountoriin. Säästä €20 000/vuosi. 30 päivää ilmaiseksi.',
    canonicalUrl: 'https://docflow.fi'
  },
  
  pricing: {
    title: 'DocFlow Hinnat - Starter €149/kk, Business €299/kk | 30 päivää ilmaiseksi',
    description: 'DocFlow hinnoittelu: Starter €149/kk (500 dok), Business €299/kk (2000 dok), Professional €499/kk (5000 dok). 30 päivän ilmainen kokeilu.',
    canonicalUrl: 'https://docflow.fi/pricing'
  },
  
  demo: {
    title: 'Varaa DocFlow Demo - 15 minuuttia, näe säästösi heti',
    description: 'Varaa 15 minuutin DocFlow demo ja näe miten säästät €20 000/vuosi laskujen automaatiolla. Henkilökohtainen esittely suomeksi.',
    canonicalUrl: 'https://docflow.fi/demo'
  },
  
  signup: {
    title: 'Aloita DocFlow Ilmainen Kokeilu - 30 päivää, ei luottokorttia',
    description: 'Aloita DocFlow:n 30 päivän ilmainen kokeilu. Ei luottokorttia, ei sitoutumista. Käyttöön 15 minuutissa. Säästä €20k/vuosi.',
    canonicalUrl: 'https://docflow.fi/signup'
  },
  
  beta: {
    title: 'DocFlow Beta-ohjelma - 6kk ilmaiseksi, vain 8 paikkaa jäljellä',
    description: 'Liity DocFlow beta-ohjelmaan: 6 kuukautta ilmaiseksi, prioriteettituki, vaikuta tuotekehitykseen. Vain 8 paikkaa jäljellä.',
    canonicalUrl: 'https://docflow.fi/beta'
  },
  
  roi: {
    title: 'ROI Laskuri - Laske DocFlow säästösi | Tyypillinen säästö €20k/vuosi',
    description: 'Laske DocFlow:n tuoma säästö yrityksellesi. Syötä laskujen määrä ja tuntipalkka - näe euromääräinen säästö ja takaisinmaksuaika.',
    canonicalUrl: 'https://docflow.fi/roi'
  }
};

// Structured data for rich snippets
export function generateStructuredData(type: 'organization' | 'product' | 'faq' | 'review', data?: any) {
  const baseUrl = 'https://docflow.fi';
  
  switch (type) {
    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'DocFlow by Converto Oy',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'Automatisoi laskut ja kuitit tekoälyllä. Säästä €20 000/vuosi.',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'FI',
          addressLocality: 'Turku'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+358-40-123-4567',
          contactType: 'customer service',
          availableLanguage: ['Finnish', 'English']
        },
        sameAs: [
          'https://linkedin.com/company/docflow-fi'
        ]
      };
      
    case 'product':
      return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'DocFlow',
        description: 'Automatisoi laskut ja kuitit 97% tarkkuudella. Integraatiot Netvisoriin ja Procountoriin.',
        url: baseUrl,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '149',
          priceCurrency: 'EUR',
          priceValidUntil: '2025-12-31',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Converto Oy'
          }
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '47',
          bestRating: '5'
        }
      };
      
    case 'faq':
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data?.faqs?.map((faq: any) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        })) || []
      };
      
    case 'review':
      return {
        '@context': 'https://schema.org',
        '@type': 'Review',
        itemReviewed: {
          '@type': 'SoftwareApplication',
          name: 'DocFlow'
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: data?.rating || '5',
          bestRating: '5'
        },
        author: {
          '@type': 'Person',
          name: data?.author || 'Marja Kivikko'
        },
        reviewBody: data?.review || 'ALV-virheet nollaantuivat. Säästämme 2 900€ kuukaudessa.'
      };
      
    default:
      return null;
  }
}

// Sitemap generation helper
export function generateSitemap() {
  const baseUrl = 'https://docflow.fi';
  const pages = [
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: '/pricing', priority: 0.9, changefreq: 'weekly' },
    { url: '/demo', priority: 0.8, changefreq: 'weekly' },
    { url: '/signup', priority: 0.9, changefreq: 'weekly' },
    { url: '/beta', priority: 0.7, changefreq: 'weekly' },
    { url: '/roi', priority: 0.6, changefreq: 'monthly' },
    { url: '/en', priority: 0.8, changefreq: 'weekly' },
    { url: '/en/pricing', priority: 0.7, changefreq: 'weekly' },
    { url: '/en/demo', priority: 0.7, changefreq: 'weekly' }
  ];
  
  return pages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq as 'daily' | 'weekly' | 'monthly',
    priority: page.priority
  }));
}
