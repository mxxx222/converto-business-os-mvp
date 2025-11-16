"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import LeadForm from "@/components/LeadForm";
import { calcROI, type RoiInput } from "@/lib/roi";
import { track } from "@/lib/track";

const DEFAULTS: RoiInput = {
  teamSize: 3,
  hoursSavedPerPerson: 10,
  hourlyCost: 38,
  invoicesPerMonth: 120,
  avgInvoiceValue: 280,
  dsoReductionDays: 9,
  annualDiscountRate: 8,
  softwareCost: 390,
};

export default function RoiCalculator() {
  const [v, setV] = useState<RoiInput>(DEFAULTS);
  const out = useMemo(() => calcROI(v), [v]);
  const strongROI = out.roiPct >= 200 || out.paybackDays <= 30;

  useEffect(() => {
    track("roi_view");
  }, []);

  useEffect(() => {
    track("roi_calculated", { input: v, output: out, roi_strong: strongROI });
    track("roi_strong", { strong: strongROI });
  }, [v, out, strongROI]);

  function num(name: keyof RoiInput) {
    return {
      value: v[name],
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        setV({ ...v, [name]: Number(e.target.value || 0) }),
    };
  }

  const ctaPrimary = strongROI ? "Aloita pilotti" : "Pyydä kypsyyskartoitus";
  const ctaSecondary = "Varaa 20 min demo";

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="card grid gap-3">
        <h2 className="text-xl font-semibold">Syötä luvut</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tiimin koko">
            <input type="number" min={1} className="input" {...num("teamSize")} />
          </Field>
          <Field label="Tuntisäästö/hlö/kk">
            <input
              type="number"
              min={0}
              className="input"
              {...num("hoursSavedPerPerson")}
            />
          </Field>
          <Field label="Tuntikustannus €/h">
            <input type="number" min={0} className="input" {...num("hourlyCost")} />
          </Field>
          <Field label="Laskuja/kk">
            <input
              type="number"
              min={0}
              className="input"
              {...num("invoicesPerMonth")}
            />
          </Field>
          <Field label="Keskimääräinen lasku €">
            <input
              type="number"
              min={0}
              className="input"
              {...num("avgInvoiceValue")}
            />
          </Field>
          <Field label="DSO-vähennys (pv)">
            <input
              type="number"
              min={0}
              className="input"
              {...num("dsoReductionDays")}
            />
          </Field>
          <Field label="Diskonttauskorko %/v">
            <input
              type="number"
              min={0}
              className="input"
              {...num("annualDiscountRate")}
            />
          </Field>
          <Field label="Ohjelmistokustannus €/kk">
            <input
              type="number"
              min={0}
              className="input"
              {...num("softwareCost")}
            />
          </Field>
        </div>
      </div>

      <div className="card grid gap-4">
        <h2 className="text-xl font-semibold">Tulokset</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat label="Manuaalin arvo/kk" value={out.timeValueMonthly} suffix="€" />
          <Stat
            label="Kassavirran arvo/kk"
            value={out.cashflowValueMonthly}
            suffix="€"
          />
          <Stat label="Hyödyt yhteensä/kk" value={out.benefitsMonthly} suffix="€" />
          <Stat label="Kustannus/kk" value={out.costMonthly} suffix="€" />
          <Stat label="Nettovaikutus/kk" value={out.netMonthly} suffix="€" />
          <Stat label="ROI" value={out.roiPct} suffix="%" />
          <Stat label="Takaisinmaksu" value={out.paybackDays} suffix="pv" />
        </div>

        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm">
            {strongROI
              ? "Tulos: nopea takaisinmaksu. Suositus: käynnistä pilotti 3–7 arkipäivässä."
              : "Tulos: rajatapauksessa. Suositus: maksuton kypsyyskartoitus ja tarkempi prosessikuvaus."}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href="#lead" className="btn btn-primary">
              {ctaPrimary}
            </a>
            <a href="/demo" className="btn border border-slate-300">
              {ctaSecondary}
            </a>
          </div>
        </div>
      </div>

      <div id="lead" className="md:col-span-2 card">
        <h3 className="mb-2 text-lg font-semibold">Jätä yhteystiedot</h3>
        <LeadForm
          context={JSON.stringify({
            input: v,
            output: out,
            strongROI,
          })}
        />
        <p className="mt-3 text-xs text-slate-500">
          Tietoturva ja Eurooppa-hosting. Toimitus 3–7 arkipäivässä.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const fmt = Number.isFinite(value)
    ? value.toLocaleString("fi-FI", { maximumFractionDigits: 0 })
    : "–";

  return (
    <div className="grid">
      <span className="text-slate-500">{label}</span>
      <span className="text-lg font-semibold">
        {fmt}
        {suffix ? ` ${suffix}` : ""}
      </span>
    </div>
  );
}
