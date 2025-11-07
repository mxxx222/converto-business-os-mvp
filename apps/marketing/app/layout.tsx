import '../styles/globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { defaultSEO } from '../lib/seo';
import Nav from '@/components/Nav';
import CookieBanner from '@/components/CookieBanner';
import { AnalyticsProvider } from './providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = defaultSEO;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" className="scroll-smooth">
      <body className="bg-white text-slate-900 antialiased">
        <Script
          src="https://plausible.io/js/script.tagged-events.js"
          data-domain="docflow.fi"
          strategy="afterInteractive"
        />
        <AnalyticsProvider>
          <Nav />
          {children}
          <CookieBanner />
        </AnalyticsProvider>
        {process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID && (
          <Script id="crisp-chat" strategy="afterInteractive">
            {`
              window.$crisp=[];window.CRISP_WEBSITE_ID="${process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID}";
              (function(){
                const d=document;
                const s=d.createElement("script");
                s.src="https://client.crisp.chat/l.js";
                s.async=1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
            `}
          </Script>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
