'use client';

import { useState } from 'react';

type FormState = {
  documents: string;
  hourlyCost: string;
  automationRate: string;
};

const INITIAL_STATE: FormState = {
  documents: '600',
  hourlyCost: '35',
  automationRate: '0.7',
};

export function ROIForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const documents = Number(form.documents) || 0;
  const hourlyCost = Number(form.hourlyCost) || 0;
  const automationRate = Number(form.automationRate) || 0;

  const hoursSaved = documents * 0.08 * automationRate;
  const monthlySavings = Math.round(hoursSaved * hourlyCost);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <section className="bg-slate-50/60 py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-slate-900">Laske DocFlow’n säästö</h2>
            <p className="mt-3 text-sm text-slate-600">
              Syötä arvioitu dokumenttimäärä ja työn kustannus. Laskemme paljonko automaatio säästää
              kuukaudessa.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-6 text-sm">
              <div>
                <dt className="text-slate-500">Säästyneet tunnit / kk</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">{hoursSaved.toFixed(1)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Arvioitu säästö / kk</dt>
                <dd className="mt-1 text-2xl font-semibold text-emerald-600">
                  € {monthlySavings.toLocaleString('fi-FI')}
                </dd>
              </div>
            </dl>
          </div>
          <form className="grid flex-1 gap-6 text-sm text-slate-600" aria-label="ROI-laskuri">
            <label className="grid gap-2">
              <span className="font-medium text-slate-700">Dokumentteja kuukaudessa</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                className="rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.documents}
                onChange={handleChange('documents')}
              />
            </label>
            <label className="grid gap-2">
              <span className="font-medium text-slate-700">Työn kustannus €/h</span>
              <input
                type="number"
                min={0}
                step={1}
                className="rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.hourlyCost}
                onChange={handleChange('hourlyCost')}
              />
            </label>
            <label className="grid gap-2">
              <span className="font-medium text-slate-700">Automaation osuus</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.1}
                className="rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.automationRate}
                onChange={handleChange('automationRate')}
              />
              <span className="text-xs text-slate-500">0 = ei automaatiota, 1 = kaikki automatisoitu</span>
            </label>
          </form>
        </div>
      </div>
    </section>
  );
}

