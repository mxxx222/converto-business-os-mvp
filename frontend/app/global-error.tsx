'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fi">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="text-6xl">😕</div>
            <h1 className="text-3xl font-bold text-gray-900">
              Jotain meni pieleen
            </h1>
            <p className="text-gray-600">
              Pahoittelemme, että tapahtui virhe. Olemme saaneet ilmoituksen ja korjaamme ongelman mahdollisimman pian.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Yritä uudelleen
              </button>
              <a
                href="/"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Palaa etusivulle
              </a>
            </div>
            <p className="text-sm text-gray-500">
              Jos ongelma jatkuu, ota yhteyttä{' '}
              <a href="mailto:info@converto.fi" className="text-blue-600 hover:underline">
                info@converto.fi
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
