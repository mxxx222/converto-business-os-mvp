'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { CalendlyButton } from './CalendlyButton';

export function ROICalculator() {
  const [documents, setDocuments] = useState(200);
  const [timePerDoc, setTimePerDoc] = useState(15);
  const [hourlyRate, setHourlyRate] = useState(40);
  
  const [results, setResults] = useState({
    manualHours: 0,
    manualCostMonthly: 0,
    manualCostAnnual: 0,
    docflowCostMonthly: 0,
    docflowCostAnnual: 0,
    savingsMonthly: 0,
    savingsAnnual: 0,
    roi: 0,
    paybackDays: 0,
    autoHours: 0
  });

  useEffect(() => {
    // Manual processing
    const manualHours = (documents * timePerDoc) / 60;
    const manualCostMonthly = manualHours * hourlyRate;
    const manualCostAnnual = manualCostMonthly * 12;

    // DocFlow cost (tiered pricing)
    let docflowCostMonthly = 149;
    if (documents > 500) docflowCostMonthly = 299;
    if (documents > 2000) docflowCostMonthly = 499;
    if (documents > 5000) docflowCostMonthly = 999;
    const docflowCostAnnual = docflowCostMonthly * 12;

    // With DocFlow (97% automation = 3% manual time)
    const autoHours = manualHours * 0.03;

    // Savings
    const savingsMonthly = manualCostMonthly - docflowCostMonthly;
    const savingsAnnual = manualCostAnnual - docflowCostAnnual;
    const roi = ((savingsAnnual / docflowCostAnnual) * 100);
    const paybackDays = (docflowCostMonthly / savingsMonthly * 30);

    setResults({
      manualHours,
      manualCostMonthly,
      manualCostAnnual,
      docflowCostMonthly,
      docflowCostAnnual,
      savingsMonthly,
      savingsAnnual,
      roi,
      paybackDays,
      autoHours
    });
  }, [documents, timePerDoc, hourlyRate]);

  return (
    <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-4">
          <Calculator className="w-6 h-6 text-yellow-300" />
          <span className="font-bold text-yellow-300">LIVE ROI-LASKURI</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          💰 Laske Paljonko Säästät
        </h2>
        <p className="text-xl text-blue-100">
          Katso konkreettinen euromääräinen säästö vuodessa
        </p>
      </div>

      {/* Inputs */}
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 mb-8">
        
        {/* Documents per month */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="font-medium text-lg">
              Dokumentteja kuukaudessa
            </label>
            <span className="text-2xl font-bold text-yellow-300">
              {documents}
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="5000"
            step="50"
            value={documents}
            onChange={(e) => setDocuments(Number(e.target.value))}
            className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-6
                     [&::-webkit-slider-thumb]:h-6
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-yellow-400
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-blue-200 mt-1">
            <span>50</span>
            <span>2,500</span>
            <span>5,000</span>
          </div>
        </div>

        {/* Time per document */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="font-medium text-lg">
              Käsittelyaika per dokumentti (min)
            </label>
            <span className="text-2xl font-bold text-yellow-300">
              {timePerDoc} min
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="5"
            value={timePerDoc}
            onChange={(e) => setTimePerDoc(Number(e.target.value))}
            className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-6
                     [&::-webkit-slider-thumb]:h-6
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-yellow-400
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-blue-200 mt-1">
            <span>5 min</span>
            <span>15 min</span>
            <span>30 min</span>
          </div>
        </div>

        {/* Hourly rate */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="font-medium text-lg">
              Tuntihinta (€/h)
            </label>
            <span className="text-2xl font-bold text-yellow-300">
              €{hourlyRate}
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-6
                     [&::-webkit-slider-thumb]:h-6
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-yellow-400
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-blue-200 mt-1">
            <span>€20/h</span>
            <span>€60/h</span>
            <span>€100/h</span>
          </div>
        </div>
      </div>

      {/* Results Comparison */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
        
        {/* BEFORE: Manual */}
        <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-300/50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>❌</span>
            <span>Manuaalinen Käsittely</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-100">Käsittelyaika/kk:</span>
              <span className="font-bold text-xl">{results.manualHours.toFixed(0)}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Kustannus/kk:</span>
              <span className="font-bold text-xl">€{results.manualCostMonthly.toLocaleString('fi-FI')}</span>
            </div>
            <div className="border-t border-red-300/30 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Vuosikustannus:</span>
                <span className="font-bold text-2xl text-red-300">
                  €{results.manualCostAnnual.toLocaleString('fi-FI')}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-red-200 mt-4 italic">
            + Virheet, viiveet, työntekijöiden väsymys
          </p>
        </div>

        {/* AFTER: DocFlow */}
        <div className="bg-green-500/20 backdrop-blur-sm border-2 border-green-300/50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>✅</span>
            <span>DocFlow Automaatio</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-100">Käsittelyaika/kk:</span>
              <span className="font-bold text-xl">{results.autoHours.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Tilaus/kk:</span>
              <span className="font-bold text-xl">€{results.docflowCostMonthly}</span>
            </div>
            <div className="border-t border-green-300/30 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Vuosikustannus:</span>
                <span className="font-bold text-2xl text-green-300">
                  €{results.docflowCostAnnual.toLocaleString('fi-FI')}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-green-200 mt-4 italic">
            + 98% tarkkuus, 0 väsymystä, instant-käsittely
          </p>
        </div>
      </div>

      {/* SAVINGS HIGHLIGHT */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-gray-900 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          
          <div>
            <div className="text-sm font-medium mb-2 opacity-80">
              💰 Kuukausisäästö
            </div>
            <div className="text-4xl font-bold">
              €{results.savingsMonthly.toLocaleString('fi-FI')}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2 opacity-80">
              🎯 Vuosisäästö
            </div>
            <div className="text-5xl font-bold">
              €{results.savingsAnnual.toLocaleString('fi-FI')}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2 opacity-80">
              📈 ROI
            </div>
            <div className="text-4xl font-bold">
              {results.roi.toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-lg font-medium mb-1">
            ⚡ Takaisinmaksuaika
          </p>
          <p className="text-3xl font-bold">
            {results.paybackDays.toFixed(0)} päivää
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-10">
        <p className="text-2xl mb-6">
          Valmis säästämään <strong className="text-yellow-300">€{results.savingsMonthly.toLocaleString('fi-FI')}</strong> kuukaudessa?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/beta"
            className="inline-block bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-xl hover:shadow-2xl transition-all"
          >
            🚀 Aloita Ilmainen Kokeilu
          </a>
          <CalendlyButton variant="secondary" size="lg" text="📅 Varaa Demo" />
        </div>
        <p className="text-sm text-blue-200 mt-4">
          💡 Ei luottokorttia • 30 päivää ilmainen • Peruuta milloin vain
        </p>
      </div>
    </div>
  );
}
