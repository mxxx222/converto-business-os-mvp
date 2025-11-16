'use client';

import { useState, useMemo } from 'react';
import { calculateROI } from '@/lib/calculateROI';
import { ROIInput, Package } from '@/types/roi';
import { z } from 'zod';

const PACKAGES: Package[] = [
  { name: 'Starter', cost: 149, docs: 500, description: 'Toiminimet, 1-5 hlö' },
  { name: 'Business', cost: 299, docs: 2000, description: '5-50 hlö' },
  { name: 'Professional', cost: 499, docs: 5000, description: '50-100 hlö' },
  { name: 'Enterprise', cost: 999, docs: 10000, description: '100+ hlö' }
];

export function EnhancedROICalculator() {
  const [invoices, setInvoices] = useState(200);
  const [minutes, setMinutes] = useState(15);
  const [rate, setRate] = useState(40);
  const [selectedPackage, setSelectedPackage] = useState(1); // Business
  
  const [error, setError] = useState<string | null>(null);
  
  // Auto-select package based on invoice count
  const suggestedPackage = useMemo(() => {
    return PACKAGES.findIndex(pkg => invoices <= pkg.docs) || 3;
  }, [invoices]);
  
  // Calculate ROI with memoization
  const roi = useMemo(() => {
    try {
      setError(null);
      const input: ROIInput = {
        invoices,
        minutesPerDoc: minutes,
        hourlyRate: rate,
        packageCost: PACKAGES[selectedPackage].cost
      };
      return calculateROI(input);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return null;
    }
  }, [invoices, minutes, rate, selectedPackage]);
  
  return (
    <div className="roi-calculator max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Laske oma Mari-hetkesi</h2>
        <p className="text-gray-600 text-lg">
          Mari menetti 50 h/kk laskuihin. Se on <strong>10 työpäivää</strong> – 
          melkein puoli kuukautta vuodessa.
        </p>
        <p className="text-gray-600 mt-2">
          <strong>Kuinka monta työpäivää sinä menetät?</strong>
        </p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Laskuja kuukaudessa
            </label>
            <input
              type="number"
              value={invoices}
              onChange={(e) => setInvoices(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              min="1"
              max="100000"
              aria-label="Laskujen määrä kuukaudessa"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Minuuttia per lasku
            </label>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              min="0.1"
              max="1440"
              step="0.5"
              aria-label="Aika per lasku minuuteissa"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Tuntipalkka (€/h)
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              min="0"
              max="1000"
              aria-label="Tuntipalkka euroina"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Paketti
              {selectedPackage !== suggestedPackage && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Suositus: {PACKAGES[suggestedPackage].name}
                </span>
              )}
            </label>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              aria-label="Valitse paketti"
            >
              {PACKAGES.map((pkg, idx) => (
                <option key={idx} value={idx}>
                  {pkg.name} – {pkg.cost}€/kk ({pkg.description})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Results */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
          {error ? (
            <div className="text-red-600 font-medium p-4 bg-red-50 rounded-lg" role="alert">
              ⚠️ {error}
            </div>
          ) : roi ? (
            <>
              <h3 className="text-2xl font-bold mb-6 text-center">Tuloksesi</h3>
              
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Menetät vuodessa</div>
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {roi.workDaysPerYear} työpäivää
                  </div>
                  <div className="text-sm text-gray-500">
                    ({roi.monthlyHours}h/kk laskujen käsittelyyn)
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">DocFlow antaa takaisin</div>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    €{parseInt(roi.yearlySavings).toLocaleString('fi-FI')}
                  </div>
                  <div className="text-sm text-gray-500">
                    vuodessa (€{parseInt(roi.monthlySavings).toLocaleString('fi-FI')}/kk)
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Takaisinmaksu</div>
                  <div className="text-4xl font-bold text-blue-600">
                    {roi.paybackDays === Infinity ? '∞' : roi.paybackDays} päivää
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                <p className="font-semibold mb-4 text-gray-900">
                  Mitä tekisit {roi.workDaysPerYear} ylimääräisellä työpäivällä?
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <input type="checkbox" className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Keskittyisin asiakkaisiin</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <input type="checkbox" className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Kehittäisin liiketoimintaa</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <input type="checkbox" className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Viettäisin aikaa perheen kanssa</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <input type="checkbox" className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Palkkaisin lisää työntekijöitä</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <a
                  href="/signup"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-4 px-6 rounded-lg font-semibold transition-colors text-lg"
                >
                  🚀 Aloita ilmainen kokeilu
                </a>
                <a
                  href="/demo"
                  className="flex-1 bg-white hover:bg-gray-50 text-blue-600 text-center py-4 px-6 rounded-lg font-semibold border-2 border-blue-600 transition-colors text-lg"
                >
                  📅 Varaa demo
                </a>
              </div>
            </>
          ) : null}
        </div>
      </div>
      
      {/* Bottom insight */}
      <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-sm text-yellow-800">
          <strong>💡 Muista:</strong> Jokainen päivä ilman automatisointia maksaa. 
          Mitä aikaisemmin aloitat, sitä enemmän säästät.
        </p>
      </div>
    </div>
  );
}
