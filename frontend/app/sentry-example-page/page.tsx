'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function SentryExamplePage() {
  const [errorTriggered, setErrorTriggered] = useState(false);

  const triggerError = () => {
    try {
      throw new Error('Test error from Sentry example page');
    } catch (error) {
      Sentry.captureException(error);
      setErrorTriggered(true);
    }
  };

  const triggerMessage = () => {
    Sentry.captureMessage('Test message from Sentry example page', 'info');
  };

  const triggerCustomEvent = () => {
    Sentry.captureEvent({
      message: 'Custom test event',
      level: 'info',
      tags: {
        component: 'sentry-example-page',
        test: true,
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sentry Error Tracking Test Page
          </h1>
          <p className="text-gray-600 mb-8">
            Tämä sivu demonstroi Sentry error tracking -toiminnallisuutta.
            Käytä näitä nappeja testataksesi erilaisia Sentry-tapahtumia.
          </p>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. Trigger Error
              </h2>
              <p className="text-gray-600 mb-4">
                Lähettää Exception-tapahtuman Sentryyn.
              </p>
              <button
                onClick={triggerError}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Trigger Error
              </button>
              {errorTriggered && (
                <p className="mt-2 text-sm text-green-600">
                  ✅ Error lähetetty Sentryyn!
                </p>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Trigger Message
              </h2>
              <p className="text-gray-600 mb-4">
                Lähettää info-tason viestin Sentryyn.
              </p>
              <button
                onClick={triggerMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Trigger Message
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                3. Trigger Custom Event
              </h2>
              <p className="text-gray-600 mb-4">
                Lähettää custom-tapahtuman Sentryyn tagien ja extra-datan kanssa.
              </p>
              <button
                onClick={triggerCustomEvent}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Trigger Custom Event
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Tarkista Sentry Dashboard:</h3>
            <p className="text-sm text-blue-800">
              Mene{' '}
              <a
                href="https://sentry.io/organizations/converto/issues/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Sentry Dashboardiin
              </a>{' '}
              nähdäksesi lähetetyt tapahtumat.
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Sentry Konfiguraatio:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Client-side: <code className="bg-gray-200 px-1 rounded">sentry.client.config.ts</code></li>
              <li>✅ Server-side: <code className="bg-gray-200 px-1 rounded">sentry.server.config.ts</code></li>
              <li>✅ Edge runtime: <code className="bg-gray-200 px-1 rounded">sentry.edge.config.ts</code></li>
              <li>✅ Next.js integration: <code className="bg-gray-200 px-1 rounded">next.config.js</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
