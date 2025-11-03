'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTracking } from '@/lib/analytics/useTracking';
import { TRACKING_EVENTS } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics';

function ThankYouContentInner() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id') || '';
  const source = searchParams.get('source') || 'website';
  const { trackEvent: trackEventFn } = useTracking();
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    // Track conversion completion only once
    if (!hasTracked && requestId) {
      trackEventFn(TRACKING_EVENTS.DEMO_FORM_SUBMITTED, {
        success: true,
        request_id: requestId,
        source,
        conversion_completed: true,
      });

      // Track in PostHog (if enabled)
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('conversion_completed', {
          type: 'demo_request',
          request_id: requestId,
          source,
        });
      }

      // Track in Plausible
      trackEvent('conversion_completed', {
        request_id: requestId,
        source,
      });

      // Track GA4 conversion (if configured)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          send_to: process.env.NEXT_PUBLIC_GA4_DEMO_CONVERSION || '',
          value: 1,
          currency: 'EUR',
          transaction_id: requestId,
        });
      }

      setHasTracked(true);
    }
  }, [requestId, source, hasTracked, trackEventFn]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-[var(--neon-green)]/20 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[var(--neon-green)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 neon-glow">
          Kiitos demo-pyynnöstäsi!
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
          Olemme vastaanottaneet demo-pyyntösi. <strong>Tiimimme ottaa sinuun yhteyttä 24 tunnin
          kuluessa</strong> ja sopii sopivan ajankohdan demo-tapaamiselle.
        </p>

        {/* Request ID */}
        {requestId && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-400 mb-1">Pyyntö-ID</p>
            <p className="text-[var(--neon-green)] font-mono text-sm">{requestId}</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6 md:p-8 mb-8 text-left">
          <h2 className="text-xl font-bold text-[var(--neon-green)] mb-4">
            Seuraavat askeleet:
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-[var(--neon-green)] mr-3">1.</span>
              <span>
                Vahvistusviesti on lähetetty sähköpostiisi. Tarkista myös roskapostikansio.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--neon-green)] mr-3">2.</span>
              <span>
                Tiimimme ottaa sinuun yhteyttä sähköpostitse tai puhelimitse 24 tunnin kuluessa.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--neon-green)] mr-3">3.</span>
              <span>
                Demo-tapaamisessa esittelemme Converto Business OS:n ominaisuudet ja auttamme
                suunnittelemaan automaatio-ratkaisut yrityksellesi.
              </span>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <p className="text-gray-400 mb-2">Jos sinulla on kysyttävää:</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href="mailto:hello@converto.fi"
              className="text-[var(--neon-green)] hover:underline"
              onClick={() => {
                trackEventFn('contact_email_clicked', { source: 'thank_you_page' });
              }}
            >
              hello@converto.fi
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="https://converto.fi"
              className="text-[var(--neon-green)] hover:underline"
              onClick={() => {
                trackEventFn('homepage_clicked', { source: 'thank_you_page' });
              }}
            >
              converto.fi
            </a>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={() => {
              trackEventFn('return_home_clicked', { source: 'thank_you_page' });
              window.location.href = '/';
            }}
            className="neon-button"
          >
            Palaa etusivulle
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              trackEventFn('read_more_clicked', { source: 'thank_you_page' });
              window.location.href = '/business-os';
            }}
          >
            Lue lisää Business OS:sta
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ThankYouContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouContentInner />
    </Suspense>
  );
}
