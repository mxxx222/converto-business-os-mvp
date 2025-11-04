'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, QrCode } from 'lucide-react';

export default function QRPage() {
  const [registrationOpen, setRegistrationOpen] = useState(false);

  useEffect(() => {
    // Check registration status
    const checkRegistration = async () => {
      try {
        const response = await fetch('/api/mockPayment');
        const data = await response.json();
        setRegistrationOpen(data.registrationOpen === true);
      } catch (error) {
        console.error('Failed to check registration status:', error);
      }
    };

    checkRegistration();
  }, []);

  const ctaText = registrationOpen
    ? 'Rekisteröidy nyt ja aloita ilmaiseksi'
    : 'Tilaa uutiskirje saadaksesi ilmoituksen kun rekisteröinti avataan';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <QrCode className="w-16 h-16 mx-auto text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Converto Business OS
        </h1>
        <p className="text-gray-600 mb-6">
          {ctaText}
        </p>
        {registrationOpen ? (
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Rekisteröidy nyt
            <ArrowRight className="w-5 h-5" />
          </Link>
        ) : (
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Tutustu palveluun
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Skannaa QR-koodi avataksesi tämän sivun mobiililaitteella
          </p>
        </div>
      </div>
    </div>
  );
}
