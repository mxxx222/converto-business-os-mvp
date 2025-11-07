import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://docflow.fi';

export const defaultSEO: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'DocFlow by Converto – Automatisoi dokumentit AI:lla',
  description:
    'DocFlow (by Converto). OCR + AI + suorat integraatiot Netvisoriin, Procountoriin ja Vero.fi:hin. Säästä jopa 70 % taloushallinnon työstä – ilman järjestelmävaihtoa.',
  openGraph: {
    title: 'DocFlow by Converto – Automatisoi dokumentit AI:lla',
    description:
      'OCR + AI + integraatiot Netvisoriin/Procountoriin ja Vero.fi-lähetys. 15 minuutin käyttöönotto.',
    url: baseUrl,
    siteName: 'DocFlow by Converto',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
    type: 'website',
    locale: 'fi_FI',
  },
  alternates: {
    canonical: '/',
    languages: { en: '/en' },
  },
  robots: { index: true, follow: true },
};
