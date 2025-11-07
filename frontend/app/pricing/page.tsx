export const revalidate = 3600

import Link from 'next/link'

export default function PricingPage() {
  return (
    <main>
      <header className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-4xl font-extrabold">Hinnasto</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Läpinäkyvät paketit. Ei yllätyksiä. Voit aloittaa ilmaisella kokeilulla ja
          päivittää milloin tahansa.
        </p>
      </header>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <Plans />
          <p className="mt-6 text-center text-sm text-slate-500">
            Hinnat alv 0 %. Ylimenevät dokumentit 0,20 €/kpl tai automaattinen skaalaus.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-2xl font-bold">Usein kysyttyä hinnoittelusta</h2>
          <div className="mt-6 space-y-4">
            <QA
              q="Voiko pakettia vaihtaa myöhemmin?"
              a="Kyllä, voit päivittää tai alentaa pakettia milloin tahansa. Muutos astuu voimaan heti."
            />
            <QA
              q="Miten dokumenttiraja toimii?"
              a="Kun saavut rajalle, voit valita joko automaattisen skaalauksen tai käsittelyn keskeytyksen ilman lisälaskutusta."
            />
            <QA
              q="Sisältyykö tuki hintoihin?"
              a="Kyllä. Starter: email‑tuki. Business: prioriteettituki. Professional/Enterprise: puhelin, SLA."
            />
            <QA
              q="Mitä tapahtuu ilmaisen kokeilun jälkeen?"
              a="Voit jatkaa maksullisella paketilla tai lopettaa. Emme veloita automaattisesti mitään."
            />
          </div>
        </div>
      </section>

      <CallToAction />
    </main>
  )
}

function Plans() {
  const plans = [
    {
      name: 'Starter',
      price: '149 €',
      period: '/kk',
      for: 'Toiminimet, 1–5 hlö',
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
      for: '5–50 hlö',
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
      for: '50–100 hlö',
      features: [
        '5 000 dokumenttia/kk',
        'API & webhookit',
        'Fraud‑esto',
        'Vero.fi‑lähetys',
        'SSO',
      ],
      cta: '/signup?plan=professional',
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((p) => (
        <div
          key={p.name}
          className={`rounded-xl border p-6 shadow-sm ${
            p.highlight ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'
          }`}
        >
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <span className="text-slate-500 text-sm">{p.for}</span>
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
            className={`mt-6 block rounded-md px-5 py-3 text-center transition-colors ${
              p.highlight
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Aloita ilmainen kokeilu
          </Link>
        </div>
      ))}
      <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Enterprise</h3>
        <p className="mt-2 text-slate-600 text-sm">
          100+ hlö / tilitoimistot – Rajaamaton, BYO‑database/on‑prem, white‑label, SLA 99,9 %, oma
          yhteyshenkilö.
        </p>
        <Link
          href="/contact?topic=enterprise"
          className="mt-6 block rounded-md border border-slate-300 px-5 py-3 text-center hover:bg-slate-50"
        >
          Ota yhteyttä
        </Link>
      </div>
    </div>
  )
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-lg border border-slate-200 bg-white p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <span className="font-medium">{q}</span>
        <span className="text-slate-500 transition group-open:rotate-45">＋</span>
      </summary>
      <p className="mt-3 text-slate-700">{a}</p>
    </details>
  )
}

function CallToAction() {
  return (
    <section className="border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold">Valmis aloittamaan?</h2>
        <p className="mt-2 text-slate-600">Ilmainen 30 päivän kokeilu – ei luottokorttia.</p>
        <Link href="/signup" className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
          Aloita ilmainen kokeilu
        </Link>
      </div>
    </section>
  )
}