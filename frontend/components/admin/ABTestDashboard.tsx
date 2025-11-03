'use client';

import { useABTestResults } from '@/lib/analytics/useABTestResults';
import { useABTest } from '@/lib/analytics/useABTest';

export function ABTestDashboard() {
  const { results, loading, error } = useABTestResults('storybrand_vs_original');
  const { variant } = useABTest();

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[var(--neon-green)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Ladataan A/B test -tuloksia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-900/20 border border-red-500/50 rounded-lg">
        <p className="text-red-400">Virhe: {error}</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Ei tuloksia saatavilla</p>
      </div>
    );
  }

  const winningVariant = results.variants.reduce((prev, current) =>
    current.conversionRate > prev.conversionRate ? current : prev
  );

  return (
    <div className="p-8 bg-black text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 neon-glow">A/B Test Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Testi: {results.testName} | Nykyinen variantti: {variant || 'loading...'}
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-sm text-gray-400 mb-2">Kokonaissivukatselut</h3>
            <p className="text-3xl font-bold text-white">{results.totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-sm text-gray-400 mb-2">Kokonaismuunnokset</h3>
            <p className="text-3xl font-bold text-[var(--neon-green)]">
              {results.totalConversions.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-sm text-gray-400 mb-2">Muunnosprosentti</h3>
            <p className="text-3xl font-bold text-white">
              {results.overallConversionRate.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Variant Comparison */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Varianttien vertailu</h2>
          <div className="space-y-6">
            {results.variants.map((variantResult, index) => {
              const isWinning = variantResult.variant === winningVariant.variant;
              const isSignificant =
                Math.abs(variantResult.conversionRate - results.overallConversionRate) > 1;

              return (
                <div
                  key={index}
                  className={`border rounded-lg p-6 ${
                    isWinning
                      ? 'border-[var(--neon-green)] bg-[var(--neon-green)]/10'
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold capitalize">{variantResult.variant}</h3>
                    {isWinning && (
                      <span className="px-3 py-1 bg-[var(--neon-green)] text-black text-xs font-bold rounded-full">
                        VOITTAJA
                      </span>
                    )}
                    {isSignificant && (
                      <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                        MERKITSEVÄ
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Katselut</p>
                      <p className="text-2xl font-bold">{variantResult.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Muunnokset</p>
                      <p className="text-2xl font-bold text-[var(--neon-green)]">
                        {variantResult.conversions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Muunnosprosentti</p>
                      <p className="text-2xl font-bold">{variantResult.conversionRate.toFixed(2)}%</p>
                    </div>
                    {variantResult.revenue !== undefined && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Tulot</p>
                        <p className="text-2xl font-bold">
                          €{variantResult.revenue.toLocaleString('fi-FI', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Muunnosprosentti</span>
                      <span>{variantResult.conversionRate.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isWinning ? 'bg-[var(--neon-green)]' : 'bg-gray-600'
                        }`}
                        style={{ width: `${Math.min(variantResult.conversionRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Test Info */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Testin tiedot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Aloituspäivä</p>
              <p className="text-white">
                {new Date(results.startDate).toLocaleDateString('fi-FI')}
              </p>
            </div>
            {results.endDate && (
              <div>
                <p className="text-gray-400">Päättymispäivä</p>
                <p className="text-white">
                  {new Date(results.endDate).toLocaleDateString('fi-FI')}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-400">Testin kesto</p>
              <p className="text-white">
                {Math.ceil(
                  (new Date(results.endDate || Date.now()).getTime() -
                    new Date(results.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                päivää
              </p>
            </div>
            <div>
              <p className="text-gray-400">Testin tila</p>
              <p className="text-[var(--neon-green)] font-bold">
                {results.endDate ? 'Päättynyt' : 'Käynnissä'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
