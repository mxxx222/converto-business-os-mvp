import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DocFlow by Converto – Automatisoi dokumentit AI:lla',
  description:
    'DocFlow (by Converto). OCR + AI + suorat integraatiot Netvisoriin, Procountoriin ja Vero.fi:hin. Säästä jopa 70 % taloushallinnon työstä – ilman järjestelmävaihtoa.',
  keywords:
    'netvisor automaatio, ostolaskut ocr, kuittien skannaus, kirjanpito automaatio, y-tunnus tarkistus, alv ilmoitus automaatio, dokumenttien digitointi, taloushallinto ai, docflow, converto',
  authors: [{ name: 'DocFlow by Converto' }],
  creator: 'DocFlow by Converto',
  publisher: 'DocFlow by Converto',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://docflow.fi'),
  alternates: {
    canonical: '/',
    languages: {
      'fi-FI': '/fi',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'DocFlow by Converto – Automatisoi dokumentit AI:lla',
    description: 'OCR + AI + integraatiot Netvisoriin/Procountoriin ja Vero.fi-lähetys. 15 minuutin käyttöönotto.',
    url: 'https://docflow.fi',
    siteName: 'DocFlow by Converto',
    images: [
      {
        url: '/og-docflow.jpg',
        width: 1200,
        height: 630,
        alt: 'DocFlow by Converto – Automatisoi dokumentit AI:lla',
      },
    ],
    locale: 'fi_FI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocFlow by Converto – Automatisoi dokumentit AI:lla',
    description: 'OCR + AI + integraatiot Netvisoriin/Procountoriin ja Vero.fi-lähetys. 15 minuutin käyttöönotto.',
    images: ['/og-docflow.jpg'],
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.converto.fi" />
        <link rel="preconnect" href="https://calendly.com" />
        <link rel="dns-prefetch" href="//resend.com" />
        <link rel="dns-prefetch" href="//plausible.io" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

