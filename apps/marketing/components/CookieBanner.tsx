'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'docflow-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    window.localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Evästeet</p>
          <p className="text-sm text-slate-600">
            Käytämme evästeitä parantaaksemme käyttökokemusta ja seurataksemme anonyymeja
            analytiikkatietoja.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAccept}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 md:w-auto"
        >
          Hyväksyn
        </button>
      </div>
    </div>
  );
}

