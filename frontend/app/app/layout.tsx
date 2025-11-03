import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Converto™ Business OS – Kirjaudu',
  description: 'Kirjaudu Converto™ Business OS -järjestelmään. Hallitse kirjanpito, maksut ja varasto yhdestä näkymästä.',
  keywords: 'kirjaudu, business os, converto, dashboard, yritykshallinta',
  authors: [{ name: 'Converto Business OS' }],
  creator: 'Converto Business OS',
  publisher: 'Converto Business OS',
  // SEO: NOINDEX - app-sivustoa ei indeksoida hakukoneissa
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  // Canonical to app domain itself
  alternates: {
    canonical: 'https://app.converto.fi',
  },
  // Open Graph metadata
  openGraph: {
    title: 'Converto™ Business OS – Kirjaudu',
    description: 'Converto Business OS – yrityksesi hallinta yhdestä näkymästä.',
    url: 'https://app.converto.fi',
    siteName: 'Converto™',
    images: [
      {
        url: 'https://converto.fi/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Converto Business OS',
      },
    ],
    locale: 'fi_FI',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    site: '@converto',
    title: 'Converto™ Business OS – Kirjaudu',
    description: 'Hallitse yrityksesi Converto Business OS:lla.',
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org structured data for WebApplication
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Converto™ Business OS',
    url: 'https://app.converto.fi',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: 'Converto Business OS – pilottikäyttö.',
    },
    provider: {
      '@type': 'Organization',
      name: 'Converto Solutions Oy',
      url: 'https://converto.fi',
    },
  };

  return (
    <>
      {/* Backup noindex meta tag */}
      <meta name="robots" content="noindex,nofollow" />
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
      {/* Plausible tracking for app subdomain */}
      <Script
        async
        defer
        data-domain="app.converto.fi"
        src="https://plausible.io/js/pa-LIVALOWbQ1Cpkjh1mkLq1.js"
      />
    </>
  );
}

