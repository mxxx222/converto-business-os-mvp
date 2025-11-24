import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { CrispChat } from '@/components/CrispChat';
import { UrgencyBanner } from '@/components/UrgencyBanner';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap'
});

export const metadata: Metadata = {
  ...generateSEOMetadata(),
  metadataBase: new URL('https://docflow.fi'),
  
  // Additional meta tags
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
    'facebook-domain-verification': process.env.FACEBOOK_DOMAIN_VERIFICATION || ''
  },
  
  // Manifest
  manifest: '/manifest.json',
  
  // Icons
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateStructuredData('organization');
  const productSchema = generateStructuredData('product');

  return (
    <html lang="fi" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Structured Data */}
        {organizationSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
        )}
        {productSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          />
        )}
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.resend.com" />
        <link rel="preconnect" href="https://client.crisp.chat" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://calendly.com" />
        <link rel="dns-prefetch" href="https://analytics.eu.posthog.com" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Calendly widget script */}
        <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
        <script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async />
      </head>
      <body className="font-sans antialiased bg-white text-gray-900">
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Siirry pääsisältöön
        </a>
        
        {/* Urgency banner */}
        <UrgencyBanner />
        
        {/* Main content */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        
        {/* Chat widget */}
        <CrispChat />
        
        {/* Analytics scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* PostHog Analytics */}
            {process.env.NEXT_PUBLIC_POSTHOG_KEY && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);var n=t;if("undefined"!=typeof e)n=t[e]=function(){n.push([e].concat(Array.prototype.slice.call(arguments,0)))};else for(var p=0;p<e.length;p++)n=n[e[p]]=function(t){return function(){n.push([t].concat(Array.prototype.slice.call(arguments,0)))}}(e[p]);return t}(p=e,a=a||"posthog"),(r=t.createElement("script")).type="text/javascript",r.async=!0,r.src=s.api_host+"/static/array.js",(n=t.getElementsByTagName("script")[0]).parentNode.insertBefore(r,n);var u=e;for(void 0!==a&&(u=e[a]=[]),u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),e},u.people.toString=function(){return u.toString()+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
                    posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_KEY}',{api_host:'https://analytics.eu.posthog.com', person_profiles: 'identified_only'})
                  `
                }}
              />
            )}
            
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                        anonymize_ip: true,
                        cookie_flags: 'SameSite=None;Secure'
                      });
                    `
                  }}
                />
              </>
            )}
          </>
        )}

        {/* CTA Event Tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.addEventListener('click', function(e) {
                  const target = e.target.closest('[data-event]');
                  if (!target) return;
                  
                  const eventName = target.getAttribute('data-event');
                  const payloadAttr = target.getAttribute('data-payload');
                  let payload = {};
                  
                  try {
                    if (payloadAttr) {
                      payload = JSON.parse(payloadAttr);
                    }
                  } catch (e) {
                    console.warn('Invalid payload JSON:', payloadAttr);
                  }
                  
                  // Track with PostHog if available
                  if (typeof window.posthog !== 'undefined') {
                    window.posthog.capture(eventName, payload);
                  }
                  
                  // Track with Google Analytics if available
                  if (typeof window.gtag !== 'undefined') {
                    window.gtag('event', eventName, {
                      event_category: 'CTA',
                      event_label: payload.source || 'unknown',
                      ...payload
                    });
                  }
                  
                  // Console log for debugging
                  if (process.env.NODE_ENV === 'development') {
                    console.log('CTA clicked:', eventName, payload);
                  }
                });
              })();
            `
          }}
        />
      </body>
    </html>
  );
}