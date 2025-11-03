import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';
import StickyPilotCTA from '@/components/StickyPilotCTA';
import { PostHogProvider } from '@/components/PostHogProvider';
import { PostHogInit } from '@/components/PostHogInit';
import { ABTestTracker } from '@/components/analytics/ABTestTracker';
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
  manifest: '/manifest.json',
  themeColor: '#667eea',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Converto',
  },
  icons: {
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body>
        <PostHogProvider>
          <PostHogInit />
          <ABTestTracker />
          {children}
          <StickyPilotCTA />
          <Analytics />
        <Script strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((reg) => console.log('Service Worker registered:', reg))
                  .catch((err) => console.log('Service Worker registration failed:', err));
              });
            }
          `}
        </Script>
        <Script strategy="afterInteractive" src="https://plausible.io/js/pa-LIVALOWbQ1Cpkjh1mkLq1.js" data-domain="converto.fi" />
        <Script id="plausible-init" strategy="afterInteractive">
          {`
            window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
            plausible.init()

            // OPTIMIZED: Track outbound links automatically
            document.addEventListener('click', function(e) {
              const link = e.target.closest('a');
              if (link && link.href && !link.href.startsWith(window.location.origin)) {
                plausible('Outbound Link Click', {
                  props: {
                    url: link.href,
                    text: link.textContent?.substring(0, 50),
                  }
                });
              }
            });

            // OPTIMIZED: Track file downloads
            document.addEventListener('click', function(e) {
              const link = e.target.closest('a');
              if (link && link.download) {
                plausible('File Download', {
                  props: {
                    filename: link.download,
                    url: link.href,
                  }
                });
              }
            });
          `}
        </Script>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <Script id="conversion-tracker" strategy="afterInteractive">
          {`
            window.trackConversion = function(eventName, params) {
              if (window.gtag) {
                gtag('event', eventName, params);
              }
              if (window.plausible) {
                plausible(eventName, { props: params });
              }
            };
          `}
        </Script>
        </PostHogProvider>
      </body>
    </html>
  );
}
