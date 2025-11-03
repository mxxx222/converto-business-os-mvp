'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics/posthog';

interface Variant {
  id: string;
  name: string;
  headline: string;
  subheading: string;
  cta: string;
  image: string;
  color: string;
}

const variants: Variant[] = [
  {
    id: 'control',
    name: 'Control (Current)',
    headline: 'Säästä 10 tuntia viikossa',
    subheading: 'Automaattinen kirjanpito ilman virheitä',
    cta: '🚀 Aloita ilmaiseksi',
    image: 'hero-default.png',
    color: '#22C55E',
  },
  {
    id: 'variant_a',
    name: 'Variant A - ROI Focus',
    headline: 'Maksa itsensä takaisin 3 kuukaudessa',
    subheading: '99€/kk → 2400€ säästöä/kk',
    cta: '💰 Näytä ROI-laskuri',
    image: 'hero-roi.png',
    color: '#3B82F6',
  },
  {
    id: 'variant_b',
    name: 'Variant B - Problem Focus',
    headline: 'Lopeta verovirhe-pelko',
    subheading: 'AI tarkistaa kaikki automaattisesti',
    cta: '✓ Poista riski nyt',
    image: 'hero-security.png',
    color: '#F59E0B',
  },
  {
    id: 'variant_c',
    name: 'Variant C - Social Proof',
    headline: '50+ suomalaista yritystä säästävät jo',
    subheading: 'Liity voittajien joukkoon',
    cta: '👥 Näytä case studyt',
    image: 'hero-social.png',
    color: '#8B5CF6',
  },
];

export default function ABTestingPage() {
  const [activeVariant, setActiveVariant] = useState<Variant>(variants[0]);
  const [results, setResults] = useState<Record<string, any>>({});

  useEffect(() => {
    // Assign user to variant (50/50 split)
    const variantId = Math.random() > 0.5 ? 'variant_a' : 'control';
    const variant = variants.find((v) => v.id === variantId) || variants[0];
    setActiveVariant(variant);

    // Track variant assignment
    trackEvent('ab_test_assigned', {
      variant_id: variant.id,
      variant_name: variant.name,
    });

    // Fetch results
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/analytics/ab-test-results');
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleCTA = () => {
    trackEvent('ab_test_cta_click', {
      variant_id: activeVariant.id,
      variant_name: activeVariant.name,
    });
    window.location.href = '/business-os/pilot';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* A/B Test Indicator */}
      <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold border border-gray-200 dark:border-gray-700">
        Test: {activeVariant.name}
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: activeVariant.color }}>
            {activeVariant.headline}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {activeVariant.subheading}
          </p>
          <button
            onClick={handleCTA}
            className="px-8 py-4 text-white rounded-lg hover:opacity-90 font-semibold text-lg transition"
            style={{ backgroundColor: activeVariant.color }}
          >
            {activeVariant.cta}
          </button>

          {/* Results Dashboard */}
          {Object.keys(results).length > 0 && (
            <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {variants.map((variant) => (
                <div key={variant.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">{variant.name}</p>
                  <p className="text-2xl font-bold" style={{ color: variant.color }}>
                    {results[variant.id]?.conversion_rate?.toFixed(1) || '0.0'}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{results[variant.id]?.clicks || 0} clicks</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

