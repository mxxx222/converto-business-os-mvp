export const metadata = {
  title: "Hinnasto – DocFlow by Converto",
  description: "Läpinäkyvät paketit ilman yllätyksiä. Starter 149€/kk, Business 299€/kk, Professional 499€/kk. 30 päivän ilmainen kokeilu.",
};

import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '149 €',
      period: '/kk',
      who: 'Toiminimet, 1–5 hlö',
      features: [
        '500 dokumenttia/kk',
        'Perus‑OCR',
        '1 integraatio',
        'Mobiili',
        'Email‑tuki',
      ],
      cta: '/signup?plan=starter',
    },
    {
      name: 'Business',
      price: '299 €',
      period: '/kk',
      who: '5–50 hlö',
      features: [
        '2 000 dokumenttia/kk',
        'Advanced OCR',
        '2 integraatiota',
        'Hyväksynnät',
        'Monikielinen AI',
        'Prioriteettituki',
      ],
      highlight: true,
      cta: '/signup?plan=business',
    },
    {
      name: 'Professional',
      price: '499 €',
      period: '/kk',
      who: '50–100 hlö',
      features: [
        '5 000 dokumenttia/kk',
        'API & webhookit',
        'Fraud‑esto',
        'Vero.fi‑lähetys',
        'SSO',
      ],
      cta: '/signup?plan=professional',
    },
  ];

  return (
    <main>
      <section className="bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">Läpinäkyvät paketit. Ei yllätyksiä.</h1>
            <p className="mt-4 text-lg text-slate-600">
              Kaikki paketit sisältävät 30 päivän ilmaisen kokeilun. Ei sitoutumista, ei piilokustannuksia.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-xl border p-6 shadow-sm ${
                  p.highlight ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-semibold">{p.name}</h3>
                  <span className="text-slate-500">{p.who}</span>
                </div>
                <div className="mt-4 text-3xl font-extrabold">
                  {p.price} <span className="text-base font-medium text-slate-500">{p.period}</span>
                </div>
                <ul className="mt-4 space-y-2 text-slate-700">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.cta}
                  className={`mt-6 block rounded-md px-5 py-3 text-center ${
                    p.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Aloita ilmainen kokeilu
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="mt-2 text-slate-600">
              100+ hlö / tilitoimistot – Rajaamaton, BYO‑database/on‑prem, white‑label, SLA 99,9 %, oma yhteyshenkilö.
            </p>
            <Link
              href="/contact?topic=enterprise"
              className="mt-6 inline-block rounded-md border border-slate-300 px-5 py-3 hover:bg-slate-50"
            >
              Ota yhteyttä
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500 text-center">
            Hinnat alv 0 %. Ylimenevät dokumentit 0,20 €/kpl tai automaattinen skaalaus.
          </p>
        </div>
      </section>
    </main>
  );
}
