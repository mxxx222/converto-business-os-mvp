import type { Metadata } from 'next';

import SBPage from '@/components/storybrand/SBPage';

export const metadata: Metadata = {
  title: 'Vapauta aikaa kasvulle: Automatisoi yrityksesi rutiinit | Converto',
  description:
    'Kirjanpito, ALV-raportointi ja asiakastuki vievät 8-15h viikossa. Converto automatisoi rutiinit ja antaa ajan kasvulle. Kokeile 30 päivää ilmaiseksi.',
  keywords: [
    'yrityksen automaatio',
    'kirjanpidon automatisointi',
    'ALV-raportointi automaatio',
    'asiakastuki automaatio',
    'business process automation',
    'suomalainen automaatioratkaisu',
  ],
  authors: [{ name: 'Converto' }],
  creator: 'Converto',
  publisher: 'Converto',

  // Open Graph
  openGraph: {
    title: 'Vapauta aikaa kasvulle: Automatisoi yrityksesi rutiinit',
    description:
      'Säästä 8-15 tuntia viikossa rutiineista. Converto automatisoi kirjanpidon, ALV-raportoinnin ja asiakastuen.',
    url: 'https://converto.fi/storybrand',
    siteName: 'Converto',
    locale: 'fi_FI',
    type: 'website',
    images: [
      {
        url: '/og-storybrand.jpg',
        width: 1200,
        height: 630,
        alt: 'Converto - Automatisoi yrityksesi rutiinit',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Vapauta aikaa kasvulle: Automatisoi yrityksesi rutiinit',
    description: 'Säästä 8-15 tuntia viikossa rutiineista. Kokeile Convertoa 30 päivää ilmaiseksi.',
    images: ['/twitter-storybrand.jpg'],
  },

  // Structured Data
  other: {
    'application-name': 'Converto',
    'msapplication-TileColor': '#39FF14',
    'theme-color': '#000000',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function PageStoryBrand() {
  return <SBPage />;
}
