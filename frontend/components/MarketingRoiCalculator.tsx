'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calculator } from 'lucide-react';

import { CalendlyButton } from './CalendlyButton';

interface RoiResults {
  manualHours: number;
  manualCostMonthly: number;
  manualCostAnnual: number;
  docflowCostMonthly: number;
  docflowCostAnnual: number;
  savingsMonthly: number;
  savingsAnnual: number;
  roi: number;
  paybackDays: number;
  autoHours: number;
}

export function MarketingRoiCalculator() {
  const [documents, setDocuments] = useState(200);
  const [timePerDoc, setTimePerDoc] = useState(15);
  const [hourlyRate, setHourlyRate] = useState(40);

  const [results, setResults] = useState<RoiResults>({
    manualHours: 0,
    manualCostMonthly: 0,
    manualCostAnnual: 0,
    docflowCostMonthly: 0,
    docflowCostAnnual: 0,
    savingsMonthly: 0,
    savingsAnnual: 0,
    roi: 0,
    paybackDays: 0,
    autoHours: 0,
  });

  useEffect(() => {
    const manualHours = (documents * timePerDoc) / 60;
    const manualCostMonthly = manualHours * hourlyRate;
    const manualCostAnnual = manualCostMonthly * 12;

    let docflowCostMonthly = 149;
    if (documents > 500) docflowCostMonthly = 299;
    if (documents > 2000) docflowCostMonthly = 499;
    if (documents > 5000) docflowCostMonthly = 999;
    const docflowCostAnnual = docflowCostMonthly * 12;

    const autoHours = manualHours * 0.03;

    const savingsMonthly = manualCostMonthly - docflowCostMonthly;
    const savingsAnnual = manualCostAnnual - docflowCostAnnual;
    const roi = docflowCostAnnual > 0 ? (savingsAnnual / docflowCostAnnual) * 100 : 0;
    const paybackDays =
      savingsMonthly > 0 ? (docflowCostMonthly / savingsMonthly) * 30 : Number.POSITIVE_INFINITY;

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
      autoHours,
    });
  }, [documents, timePerDoc, hourlyRate]);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8 text-white shadow-2xl md:p-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 backdrop-blur-sm">
          <Calculator className="h-6 w-6 text-yellow-300" />
          <span className="font-bold text-yellow-300">LIVE ROI-LASKURI</span>
        </div>
        <h2 className="mb-3 text-3xl font-bold md:text-4xl">💰 Laske paljonko säästät</h2>
        <p className="text-xl text-blue-100">Katso konkreettinen euromääräinen säästö vuodessa</p>
      </div>

      <div className="mb-8 mx-auto max-w-3xl rounded-xl bg-white/10 p-6 backdrop-blur-sm md:p-8">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-lg font-medium">Dokumentteja kuukaudessa</label>
            <span className="text-2xl font-bold text-yellow-300">{documents}</span>
          </div>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={documents}
            onChange={(e) => setDocuments(Number(e.target.value))}
            className="w-full cursor-pointer appearance-none rounded-lg bg-white/20"
          />
          <div className="mt-1 flex justify-between text-xs text-blue-200">
            <span>50</span>
            <span>2,500</span>
            <span>5,000</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-lg font-medium">Käsittelyaika per dokumentti (min)</label>
            <span className="text-2xl font-bold text-yellow-300">{timePerDoc} min</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={timePerDoc}
            onChange={(e) => setTimePerDoc(Number(e.target.value))}
            className="w-full cursor-pointer appearance-none rounded-lg bg-white/20"
          />
          <div className="mt-1 flex justify-between text-xs text-blue-200">
            <span>5 min</span>
            <span>15 min</span>
            <span>30 min</span>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-lg font-medium">Tuntihinta (€/h)</label>
            <span className="text-2xl font-bold text-yellow-300">€{hourlyRate}</span>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="w-full cursor-pointer appearance-none rounded-lg bg-white/20"
          />
          <div className="mt-1 flex justify-between text-xs text-blue-200">
            <span>€20/h</span>
            <span>€60/h</span>
            <span>€100/h</span>
          </div>
        </div>
      </div>

      <div className="mx-auto mb-8 grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="rounded-xl border-2 border-red-300/50 bg-red-500/20 p-6 backdrop-blur-sm">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <span>❌</span>
            <span>Manuaalinen käsittely</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-100">Käsittelyaika/kk:</span>
              <span className="text-xl font-bold">{results.manualHours.toFixed(0)} h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Kustannus/kk:</span>
              <span className="text-xl font-bold">
                €
                {results.manualCostMonthly.toLocaleString("fi-FI", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="mt-3 border-t border-red-300/30 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Vuosikustannus:</span>
                <span className="text-2xl font-bold text-red-300">
                  €
                  {results.manualCostAnnual.toLocaleString("fi-FI", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm italic text-red-200">
            + Virheet, viiveet, työntekijöiden väsymys
          </p>
        </div>

        <div className="rounded-xl border-2 border-green-300/50 bg-green-500/20 p-6 backdrop-blur-sm">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <span>✅</span>
            <span>DocFlow automaatio</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-100">Käsittelyaika/kk:</span>
              <span className="text-xl font-bold">{results.autoHours.toFixed(1)} h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Tilaus/kk:</span>
              <span className="text-xl font-bold">€{results.docflowCostMonthly}</span>
            </div>
            <div className="mt-3 border-t border-green-300/30 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Vuosikustannus:</span>
                <span className="text-2xl font-bold text-green-300">
                  €
                  {results.docflowCostAnnual.toLocaleString("fi-FI", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm italic text-green-200">
            + 98 % tarkkuus, ei väsymystä, lähes reaaliaikainen käsittely
          </p>
        </div>
      </div>

      <div className="mx-auto mb-8 max-w-4xl rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-8 text-gray-900 shadow-2xl">
        <div className="grid gap-6 text-center md:grid-cols-3">
          <div>
            <div className="mb-2 text-sm font-medium opacity-80">💰 Kuukausisäästö</div>
            <div className="text-4xl font-bold">
              €
              {results.savingsMonthly.toLocaleString("fi-FI", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-medium opacity-80">🎯 Vuosisäästö</div>
            <div className="text-5xl font-bold">
              €
              {results.savingsAnnual.toLocaleString("fi-FI", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-medium opacity-80">📈 ROI</div>
            <div className="text-4xl font-bold">
              {Number.isFinite(results.roi) ? results.roi.toFixed(0) : "∞"}%
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="mb-1 text-lg font-medium">⚡ Takaisinmaksuaika</p>
          <p className="text-3xl font-bold">
            {Number.isFinite(results.paybackDays)
              ? `${results.paybackDays.toFixed(0)} päivää`
              : "Alle 30 päivää"}
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="mb-6 text-2xl">
          Valmis säästämään{" "}
          <strong className="text-yellow-300">
            €
            {results.savingsMonthly.toLocaleString("fi-FI", {
              maximumFractionDigits: 0,
            })}
          </strong>{" "}
          kuukaudessa?
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/beta"
            className="inline-block rounded-xl bg-white px-10 py-5 text-xl font-bold text-blue-600 shadow-2xl transition-all hover:shadow-[0_20px_40px_rgba(15,23,42,0.45)]"
          >
            🚀 Aloita ilmainen kokeilu
          </Link>
          <CalendlyButton variant="secondary" size="lg" text="📅 Varaa demo" />
        </div>
        <p className="mt-4 text-sm text-blue-200">
          💡 Ei luottokorttia • 30 päivää ilmainen • Peruuta milloin vain
        </p>
      </div>
    </div>
  );
}



