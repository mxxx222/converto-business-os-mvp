import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Converto Business OS - Automaatio yrityksellesi | Premium',
  description: 'Automatisoi yrityksesi Converto Business OS:lla. OCR-kuittien käsittely, ALV-laskelmat, lakisäädäntöjen seuranta ja paljon muuta. Aloita ilmaiseksi.',
  keywords: 'automaatio, yritys, OCR, ALV, laskutus, Suomi, business os, converto',
  authors: [{ name: 'Converto Business OS' }],
  creator: 'Converto Business OS',
  publisher: 'Converto Business OS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://converto.fi'),
  alternates: {
    canonical: '/premium',
    languages: {
      'fi-FI': '/premium',
      'en-US': '/en/premium',
    },
  },
  openGraph: {
    title: 'Converto Business OS - Automaatio yrityksellesi',
    description: 'Automatisoi yrityksesi Converto Business OS:lla. OCR-kuittien käsittely, ALV-laskelmat, lakisäädäntöjen seuranta ja paljon muuta.',
    url: 'https://converto.fi/premium',
    siteName: 'Converto Business OS',
    images: [
      {
        url: '/og-image-premium.jpg',
        width: 1200,
        height: 630,
        alt: 'Converto Business OS - Automaatio yrityksellesi',
      },
    ],
    locale: 'fi_FI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Converto Business OS - Automaatio yrityksellesi',
    description: 'Automatisoi yrityksesi Converto Business OS:lla. OCR-kuittien käsittely, ALV-laskelmat, lakisäädäntöjen seuranta.',
    images: ['/og-image-premium.jpg'],
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
}

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      {/* Mobile sticky CTA */}
      <div className="sticky-cta">
        <a className="btn btn-primary" href="#start">Aloita pilotti</a>
      </div>
      
      {/* Structured Data - FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Mikä on Converto Business OS?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Converto Business OS on automaatioplatformi, joka helpottaa yrityksen hallintoa OCR-kuittien käsittelyllä, ALV-laskelmilla ja lakisäädäntöjen seurannalla."
                }
              },
              {
                "@type": "Question",
                "name": "Kuinka paljon Converto Business OS maksaa?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Converto Business OS alkaa 99€/kuukausi per laite. Tarjoamme 30 päivän ilmaisen kokeilun ja takuun."
                }
              },
              {
                "@type": "Question",
                "name": "Voinko aloittaa ilmaiseksi?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Kyllä! Tarjoamme 30 päivän ilmaisen kokeilun ilman sitoumuksia. Voit peruuttaa milloin tahansa."
                }
              }
            ]
          })
        }}
      />

      {/* Structured Data - Product/Offer Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Converto Business OS",
            "description": "Automaatioplatformi yrityksen hallintaan",
            "brand": {
              "@type": "Brand",
              "name": "Converto"
            },
            "offers": [
              {
                "@type": "Offer",
                "name": "Pilot - 30 päivän kokeilu",
                "price": "0",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock",
                "validFrom": "2024-01-01",
                "description": "30 päivän ilmainen kokeilu"
              },
              {
                "@type": "Offer",
                "name": "Business - Peruspalvelu",
                "price": "99",
                "priceCurrency": "EUR",
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": "99",
                  "priceCurrency": "EUR",
                  "unitText": "MONTH"
                },
                "availability": "https://schema.org/InStock",
                "validFrom": "2024-01-01",
                "description": "Peruspalvelu yhdelle laitteelle"
              }
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "127"
            }
          })
        }}
      />
    </>
  )
}
