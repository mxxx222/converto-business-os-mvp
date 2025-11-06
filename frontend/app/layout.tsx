import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Converto.fi - AI-Pohjainen B2B-Dokumenttien Automaatio | Business OS',
  description: 'Automatisoi ostolaskut, ALV-kuitit, rahtikirjat. Netvisor & Procountor integraatio. Säästä €20,000/vuosi. 3kk ilmainen pilotti.',
  keywords: 'document automation, invoice OCR, receipt scanning, ALV automation, Netvisor integration, Procountor, Y-tunnus validation, business document processing, Suomi',
  authors: [{ name: 'Converto Team' }],
  creator: 'Converto.fi',
  publisher: 'Converto.fi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://converto.fi'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Converto.fi - Automatisoi Kaikki Yrityksesi Dokumentit',
    description: 'Ostolaskut, ALV-kuitit, rahtikirjat - automaattisesti kirjanpitoon. Säästä €20k/vuosi.',
    url: 'https://converto.fi',
    siteName: 'Converto Business OS',
    locale: 'fi_FI',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Converto Business OS - Document Automation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Converto.fi - AI-Pohjainen Dokumenttien Automaatio',
    description: 'Säästä €20k/vuosi automatisoimalla kaikki yrityksesi dokumentit',
    images: ['/og-image.png'],
    creator: '@convertofi',
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
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.resend.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  custom_map: {
                    'custom_parameter_1': 'document_types',
                    'custom_parameter_2': 'company_size',
                    'custom_parameter_3': 'monthly_volume'
                  }
                });

                // Enhanced ecommerce tracking
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  custom_map: {'metric1': 'roi_percentage', 'metric2': 'savings_amount'}
                });

                // Track custom events
                function trackBetaSignup(companyName, documentTypes) {
                  gtag('event', 'beta_signup', {
                    'event_category': 'conversion',
                    'event_label': companyName,
                    'value': 2990,
                    'document_types': documentTypes,
                    'currency': 'EUR'
                  });
                }

                function trackDemoBook() {
                  gtag('event', 'demo_booked', {
                    'event_category': 'conversion',
                    'event_label': 'calendly_booking',
                    'value': 500
                  });
                }

                function trackROICalculation(savings) {
                  gtag('event', 'roi_calculated', {
                    'event_category': 'engagement',
                    'event_label': 'roi_calculator',
                    'value': savings
                  });
                }

                // Make functions available globally
                window.trackBetaSignup = trackBetaSignup;
                window.trackDemoBook = trackDemoBook;
                window.trackROICalculation = trackROICalculation;
              `}
            </Script>
          </>
        )}

        {/* Crisp Live Chat Widget */}
        <Script 
          id="crisp-chat"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.$crisp=[];
              window.CRISP_WEBSITE_ID="${process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || 'YOUR_CRISP_ID'}";
              (function(){
                d=document;
                s=d.createElement("script");
                s.src="https://client.crisp.chat/l.js";
                s.async=1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
              
              // Configure Crisp for B2B
              $crisp.push(["set", "session:data", [[
                ["page_type", "homepage"],
                ["visitor_type", "b2b_prospect"],
                ["product_interest", "document_automation"]
              ]]]);
              
              // Auto-message after 30 seconds
              setTimeout(function() {
                if (window.$crisp && !localStorage.getItem('crisp_welcomed')) {
                  $crisp.push(["do", "message:show", ["text", "👋 Hei! Kysyttävää dokumenttien automaatiosta? Vastaan yleensä alle 5 minuutissa!"]]);
                  localStorage.setItem('crisp_welcomed', 'true');
                }
              }, 30000);
              
              // Trigger on scroll to pricing
              let pricingViewed = false;
              document.addEventListener('scroll', function() {
                const pricingSection = document.getElementById('pricing');
                if (pricingSection && !pricingViewed && window.scrollY > pricingSection.offsetTop - 200) {
                  pricingViewed = true;
                  $crisp.push(["set", "session:event", [[["viewed_pricing", true]]]]);
                  
                  // Offer help after viewing pricing
                  setTimeout(() => {
                    if (window.$crisp) {
                      $crisp.push(["do", "message:show", ["text", "Näin että katsoit hinnoittelua! 💰 Haluatko että lasken ROI:n juuri teidän yrityksellenne?"]]);
                    }
                  }, 10000);
                }
              });

              // Track beta form interactions
              document.addEventListener('DOMContentLoaded', function() {
                const betaForm = document.querySelector('#beta form');
                if (betaForm) {
                  betaForm.addEventListener('submit', function() {
                    $crisp.push(["set", "session:event", [[["beta_form_submitted", true]]]]);
                  });
                }
              });
            `
          }}
        />

        {/* Calendly Widget Script */}
        <Script 
          src="https://assets.calendly.com/assets/external/widget.js" 
          strategy="lazyOnload"
        />

        {/* Hotjar (optional - heatmaps & recordings) */}
        {process.env.NEXT_PUBLIC_HOTJAR_ID && (
          <Script id="hotjar" strategy="afterInteractive">
            {`
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              
              // Track B2B specific events
              hj('event', 'b2b_homepage_visit');
            `}
          </Script>
        )}

        {/* Facebook Pixel (optional - if using FB ads) */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
              fbq('track', 'PageView');
              
              // Track B2B events
              fbq('trackCustom', 'B2BHomepageView', {
                product: 'document_automation',
                market: 'finland'
              });
            `}
          </Script>
        )}

        {/* Performance monitoring initialization */}
        <Script id="performance-monitoring" strategy="afterInteractive">
          {`
            // Initialize performance monitoring
            if (typeof window !== 'undefined') {
              // Track page load performance
              window.addEventListener('load', function() {
                if (window.performance) {
                  const navTiming = performance.getEntriesByType('navigation')[0];
                  const loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
                  
                  if (window.gtag) {
                    gtag('event', 'page_load_time', {
                      event_category: 'performance',
                      value: Math.round(loadTime),
                      page_path: window.location.pathname
                    });
                  }
                  
                  // Log slow pages
                  if (loadTime > 3000) {
                    console.warn('Slow page load:', Math.round(loadTime) + 'ms');
                  }
                }
              });

              // Track Core Web Vitals
              if ('PerformanceObserver' in window) {
                // Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  const lastEntry = entries[entries.length - 1];
                  
                  if (window.gtag) {
                    gtag('event', 'web_vitals', {
                      event_category: 'performance',
                      event_label: 'LCP',
                      value: Math.round(lastEntry.startTime)
                    });
                  }
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // Cumulative Layout Shift
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  
                  entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                      clsValue += entry.value;
                    }
                  });

                  if (window.gtag) {
                    gtag('event', 'web_vitals', {
                      event_category: 'performance',
                      event_label: 'CLS',
                      value: Math.round(clsValue * 1000)
                    });
                  }
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
              }
            }
          `}
        </Script>

        {/* JSON-LD Structured Data for SEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Converto Business OS",
              "description": "AI-pohjainen B2B-dokumenttien automaatioalusta suomalaisille yrityksille",
              "url": "https://converto.fi",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web, iOS, Android",
              "offers": {
                "@type": "Offer",
                "price": "149",
                "priceCurrency": "EUR",
                "priceValidUntil": "2025-12-31",
                "availability": "https://schema.org/InStock"
              },
              "provider": {
                "@type": "Organization",
                "name": "Converto.fi",
                "url": "https://converto.fi",
                "logo": "https://converto.fi/logo.png",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+358-40-123-4567",
                  "contactType": "customer service",
                  "availableLanguage": ["Finnish", "English"]
                }
              },
              "featureList": [
                "OCR Document Processing",
                "Netvisor Integration", 
                "Procountor Integration",
                "Mobile App",
                "Fraud Detection",
                "AI Categorization",
                "Approval Workflows"
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
