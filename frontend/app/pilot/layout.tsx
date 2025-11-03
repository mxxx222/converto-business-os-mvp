import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Liity Converto™ Business OS Pilottiin - 30pv Ilmaiseksi',
  description: 'Liity pilottiin ja saa 30 päivää maksutonta käyttöä. Automatisoi yrityksesi ilman riskiä. Ensimmäiset 50 yritystä.',
  keywords: 'pilotti, ilmaiseksi, automatisointi, business os, converto, aloita',
  authors: [{ name: 'Converto Business OS' }],
  creator: 'Converto Business OS',
  publisher: 'Converto Business OS',
  // SEO: NOINDEX - pilot-sivua ei indeksoida hakukoneissa
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  // Canonical: palauta hakuarvo päädomainiin
  alternates: {
    canonical: 'https://converto.fi',
  },
  // Open Graph metadata brändin vahvistamiseksi
  openGraph: {
    title: 'Liity Converto™ Business OS Pilottiin',
    description: 'Liity pilottiin ja automatisoi yrityksesi 30 päivää ilmaiseksi.',
    url: 'https://pilot.converto.fi',
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
    card: 'summary_large_image',
    title: 'Liity Converto™ Business OS Pilottiin',
    description: 'Automatisoi yrityksesi 30 päivää ilmaiseksi.',
    images: ['https://converto.fi/og-image.jpg'],
  },
};

export default function PilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org structured data for Business OS
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Converto™ Business OS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: 'Pilottilisenssi – ilmainen 30 päivän käyttöönotto.',
    },
    brand: {
      '@type': 'Brand',
      name: 'Converto Solutions Oy',
      url: 'https://converto.fi',
    },
  };

  return (
    <html lang="fi">
      <head>
        {/* Canonical link - redirect SEO value to main domain */}
        <link rel="canonical" href="https://converto.fi" />
        {/* Backup noindex meta tag */}
        <meta name="robots" content="noindex, nofollow" />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>
        {children}
        {/* Plausible tracking for pilot subdomain */}
        <Script
          async
          defer
          data-domain="pilot.converto.fi"
          src="https://plausible.io/js/pa-LIVALOWbQ1Cpkjh1mkLq1.js"
        />
      </body>
    </html>
  );
}

