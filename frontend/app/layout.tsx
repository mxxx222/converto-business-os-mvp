import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';
import { ABTestTracker } from '@/components/analytics/ABTestTracker';
import { PostHogProvider } from '@/components/PostHogProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Converto Business OS - Automaatio yrityksellesi',
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
    canonical: '/',
    languages: {
      'fi-FI': '/',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'Converto Business OS - Automaatio yrityksellesi',
    description: 'Automatisoi yrityksesi Converto Business OS:lla. OCR-kuittien käsittely, ALV-laskelmat, lakisäädäntöjen seuranta ja paljon muuta.',
    url: 'https://converto.fi',
    siteName: 'Converto Business OS',
    images: [
      {
        url: '/og-image.jpg',
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
    images: ['/og-image.jpg'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="fi">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.converto.fi" />
        <link rel="preconnect" href="https://calendly.com" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//resend.com" />
        <link rel="dns-prefetch" href="//plausible.io" />

        {/* Privacy-friendly analytics by Plausible */}
        <script async src="https://plausible.io/js/pa-LIVALOWbQ1Cpkjh1mkLq1.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
              plausible.init()
            `,
          }}
        />
      </head>
      <body>
        <PostHogProvider>
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="text-xl font-bold text-gray-900">
                  CONVERTO
                </a>
                <div className="ml-10 flex items-baseline space-x-4">
                  <a
                    href="/dashboard"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </a>
                  {process.env.NODE_ENV !== 'production' && (
                    <a
                      href="/storybrand/totals"
                      className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium dev-link"
                    >
                      Totals
                    </a>
                  )}
                  <a
                    href="/receipts"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Kuitit
                  </a>
                  <a
                    href="/receipts/list"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Lista
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
        <Analytics />
        <ABTestTracker />
        <Toaster richColors position="top-right" />
        </PostHogProvider>
      </body>
    </html>
  );
}
