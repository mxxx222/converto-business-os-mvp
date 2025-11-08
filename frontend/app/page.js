export const revalidate = 3600; // ISR 1h

import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustBadges />
      <Why />
      <HowItWorks />
      <Features />
      <Security />
      <References />
      <Pricing />
      <Integrations />
      <Tech />
      <FAQ />
      <ROI />
      <CTA />
      <Footer />
    </main>
  );
}

/* --- NAVBAR --- */
function Navbar() {
  return (
    <nav className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-extrabold text-slate-900">
          DocFlow
        </Link>
        <ul className="hidden items-center gap-6 md:flex">
          <li>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
              Hinnasto
            </Link>
          </li>
          <li>
            <Link href="/integrations" className="text-slate-600 hover:text-slate-900 transition-colors">
              Integraatiot
            </Link>
          </li>
          <li>
            <Link href="/security" className="text-slate-600 hover:text-slate-900 transition-colors">
              Tietoturva
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-slate-600 hover:text-slate-900 transition-colors">
              Yhteys
            </Link>
          </li>
          <li>
            <Link href="/signup" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
              Kokeile ilmaiseksi
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

/* --- HERO --- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:flex lg:items-center lg:gap-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Vähemmän manuaalia. Enemmän liiketoimintaa.
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            DocFlow automatisoi kuittien ja ostolaskujen käsittelyn. Integraatiot Netvisoriin, Procountoriin ja
            Vero.fi‑lähetys – ilman järjestelmävaihtoa.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700"
            >
              Aloita ilmainen 30 päivän kokeilu
            </Link>
            <Link
              href="/demo"
              className="rounded-md border border-slate-300 px-5 py-3 text-slate-800 hover:bg-slate-50"
            >
              Varaa 15 min demo
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Ei luottokorttia. Peru milloin tahansa. EU‑palvelimet. GDPR‑yhteensopiva.
          </p>
        </div>
        <div className="mt-12 lg:mt-0 lg:flex-1">
          <div className="aspect-[16/10] w-full rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <div className="text-lg font-semibold text-slate-700">DocFlow Demo</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- TRUST BADGES --- */
function TrustBadges() {
  const items = [
    { label: 'EU Hosting', icon: '🇪🇺' },
    { label: 'GDPR', icon: '🔒' },
    { label: 'Suomi.fi', icon: '🇫🇮' },
    { label: '99.9% SLA', icon: '⚡' },
    { label: 'Bank-grade Security', icon: '🛡️' },
  ];

  return (
    <section className="bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-center gap-6 opacity-90">
          {items.map(b => (
            <div key={b.label} className="flex items-center gap-2">
              <span className="text-2xl">{b.icon}</span>
              <span className="text-sm text-slate-700">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- WHY --- */
function Why() {
  const items = [
    {
      title: 'Automaattinen OCR + AI',
      desc: 'Tunnistaa toimittajan, Y‑tunnuksen, summan, ALV:n, viitenumeron ja eräpäivän. Oppii korjauksista – tarkkuus paranee joka päivä.',
    },
    {
      title: 'Suorat integraatiot',
      desc: 'Netvisor, Procountor, Holvi, Zervant – yksi klikkaus, ei manuaalista syöttöä. Vero.fi‑lähetys suoraan Suomi.fi‑valtuutuksella.',
    },
    {
      title: 'Nopea käyttöönotto',
      desc: '15 minuutissa käyttöön. Toimii nykyisten prosessiesi päällä – ei migraatiopakkoa.',
    },
  ];

  return (
    <section className="border-t border-slate-100 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Miksi DocFlow?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">{i.title}</h3>
              <p className="mt-2 text-slate-600">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- HOW IT WORKS --- */
function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Ota kuva tai lähetä PDF',
      desc: 'Mobiiliapp, sähköpostiohjaus, drag&drop tai API.',
    },
    {
      step: '2',
      title: 'AI käsittelee',
      desc: 'OCR + tietotarkistus (Y‑tunnus, viite, IBAN). Automaattinen kategorisointi ja hyväksyntäsäännöt.',
    },
    {
      step: '3',
      title: 'Lähetä minne haluat',
      desc: 'Netvisor/Procountor/ERP – tai suoraan Vero.fi:hin ALV‑ilmoituksena.',
    },
  ];

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Kolme askelta, valmis</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="rounded-xl border border-slate-200 p-6">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-center text-white leading-10">{s.step}</div>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">Keskimäärin 3,1 s / dokumentti.</p>
      </div>
    </section>
  );
}

/* --- FEATURES --- */
function Features() {
  const list = [
    ['Ostolaskut', 'AI täyttää kentät, tunnistaa poikkeamat ja luo hyväksyntäketjut.'],
    ['Kuitit (ALV)', 'Mobiilikaappaus, ALV‑erottelu, kululuokat, työntekijäkohtaiset hyväksynnät.'],
    ['Rahtikirjat & tilausvahvistukset', 'OCR riveittäin, automaattinen hinnoittelu ja laskutus.'],
    ['Vero.fi', 'ALV‑ilmoitukset suoraan DocFlow:sta Suomi.fi‑valtuutuksella.'],
    ['Duplikaatit & petosesto', 'Fuzzy‑haku viitteistä, summista ja toimittajista – varoitukset ennen maksua.'],
    ['Monikielinen AI', 'FI, EN, SV, RU, ET, SO, AR, UK, VI – puhe tai teksti, selkokieliset vastaukset.'],
    ['BYO Database', 'Omista datasi (Supabase/Postgres). DocFlow prosessoi, sinä päätät sijainnin.'],
    ['API & Webhookit', 'Kytke CRM/ERP/Raportointi. Tapahtumat reaaliajassa.'],
  ];

  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Kaikki mitä tarvitset – ilman monimutkaisuutta</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {list.map(([t, d]) => (
            <div key={t} className="rounded-xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- SECURITY --- */
function Security() {
  const items = [
    'EU‑isännöinti (Supabase EU‑West, Vercel EU)',
    'Salaus siirrossa ja levossa (TLS 1.2+, AES‑256)',
    'Row Level Security (RLS), roolit ja audit‑lokit',
    'DPA, DPIA – valmiit pohjat',
    '10 vuoden säilytys kirjanpitolain mukaan',
    'SOC 2 Type II ‑polku (sertifiointi käynnissä)',
  ];

  return (
    <section className="bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Pankkitason tietoturva. EU‑palvelimet. GDPR by design.</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-700">{i}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --- REFERENCES --- */
function References() {
  const cases = [
    {
      name: 'Rakennusyritys, 28 hlö',
      result: '45 h/kk → 6 h/kk, säästö €2 900/kk. "ALV‑virheet nollaantuivat."',
    },
    {
      name: 'Kuljetus, 70 hlö',
      result: 'Rahtikirjat + laskutusautomaatio, säästö €4 500/kk. "Duplikaatit loppuivat."',
    },
    {
      name: 'IT‑konsultointi, 12 hlö',
      result: 'Kuitit + hyväksynnät, säästö €1 150/kk. "Mobiili on huikea."',
    },
  ];

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Todistetut säästöt – 2–8 viikossa</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cases.map((c) => (
            <div key={c.name} className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold">{c.name}</h3>
              <p className="mt-2 text-slate-700">{c.result}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- PRICING --- */
function Pricing() {
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
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Läpinäkyvät paketit. Ei yllätyksiä.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border p-6 shadow-sm ${
                p.highlight ? 'border-blue-600' : 'border-slate-200'
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
          <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="mt-2 text-slate-600">
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
        <p className="mt-4 text-sm text-slate-500">Hinnat alv 0 %. Ylimenevät dokumentit 0,20 €/kpl tai automaattinen skaalaus.</p>
      </div>
    </section>
  );
}

/* --- INTEGRATIONS --- */
function Integrations() {
  const integrations = [
    { name: 'Netvisor', icon: '📊' },
    { name: 'Procountor', icon: '💼' },
    { name: 'Holvi', icon: '🏦' },
    { name: 'Zervant', icon: '📋' },
    { name: 'Vero.fi', icon: '🇫🇮' },
  ];

  return (
    <section className="bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Toimii nykyisen taloushallintosi kanssa</h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 opacity-80">
          {integrations.map((l) => (
            <div key={l.name} className="flex items-center gap-2">
              <span className="text-2xl">{l.icon}</span>
              <span className="text-lg font-semibold">{l.name}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600 text-center">
          Puuttuuko integraatio? Rakennamme 2–4 viikossa.
        </p>
      </div>
    </section>
  );
}

/* --- TECH --- */
function Tech() {
  const items = [
    'Next.js 14, React Server Components, Edge‑middleware',
    'Supabase (Postgres, Auth, RLS), Redis‑cache',
    'Vercel (ISR, CDN), Sentry, Resend',
    'ML‑pipeline: multi‑OCR ensemble, konsensus, jatkuva oppiminen',
    'API‑ensimmäinen: REST + webhookit',
  ];

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Moderni pino – skaalautuva ja testattu</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-slate-700">{i}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --- FAQ --- */
function FAQ() {
  const faqs = [
    ['Pitääkö Netvisor tai Procountor vaihtaa?', 'Ei. DocFlow vähentää manuaalityötä, integraatiot pitävät kirjanpidon ennallaan.'],
    ['Onko Vero.fi‑lähetys sallittua?', 'Kyllä. Käytämme Suomi.fi‑valtuutusta ja Vero.fi:n julkista rajapintaa.'],
    ['Miten tietoturva on toteutettu?', 'EU‑palvelimet, RLS, salaus, audit‑lokit ja DPA. Enterprise‑paketissa BYO‑database tai on‑prem.'],
    ['Paljonko säästämme?', 'Tyypillisesti 20–70 %. Laske tarkka säästö ROI‑laskurilla alempana.'],
  ];

  return (
    <section className="border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Usein kysytyt</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200">
          {faqs.map(([q, a]) => (
            <details key={q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg font-semibold">{q}</span>
                <span className="text-slate-500 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-slate-700">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- ROI CALCULATOR --- */
function ROI() {
  return (
    <section className="bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Laske, paljonko säästät</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-slate-600">ROI-laskuri tulossa pian...</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-md p-3 bg-slate-50">
                <span className="text-sm">Nykyiset kulut</span>
                <span className="text-lg font-semibold">€2,000/kk</span>
              </div>
              <div className="flex items-center justify-between rounded-md p-3 bg-slate-50">
                <span className="text-sm">DocFlow‑kustannus</span>
                <span className="text-lg font-semibold">€299/kk</span>
              </div>
              <div className="flex items-center justify-between rounded-md p-3 bg-emerald-50 text-emerald-700">
                <span className="text-sm">Kuukausisäästö</span>
                <span className="text-lg font-semibold">€1,701/kk</span>
              </div>
              <div className="flex items-center justify-between rounded-md p-3 bg-slate-50">
                <span className="text-sm">Vuosisäästö</span>
                <span className="text-lg font-semibold">€20,412/v</span>
              </div>
            </div>
            <Link href="/signup" className="mt-6 block rounded-md bg-blue-600 px-5 py-3 text-center text-white hover:bg-blue-700">
              Aloita ilmainen kokeilu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- CTA --- */
function CTA() {
  return (
    <section className="border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Valmis siirtymään automaatioon?</h2>
        <p className="mt-3 text-slate-600">
          Varaa 15 min demo tai aloita ilmainen kokeilu. Saat käyttöönoton 15 minuutissa ja tuen suomeksi.
        </p>
        <div className="mt-7 flex justify-center gap-4">
          <Link href="/signup" className="rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
            Aloita ilmainen kokeilu
          </Link>
          <Link href="/demo" className="rounded-md border border-slate-300 px-5 py-3 hover:bg-slate-50">
            Varaa demo
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --- FOOTER --- */
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-white font-semibold">DocFlow by Converto</h3>
            <p className="mt-2 text-sm">
              Automatisoi dokumentit AI:lla
              <br />
              Turku, Finland
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Tuote</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li><Link href="/pricing" className="hover:text-white transition-colors">Hinnasto</Link></li>
              <li><Link href="/integrations" className="hover:text-white transition-colors">Integraatiot</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Tietoturva</Link></li>
              <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Yritys</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Tietosuoja</Link></li>
              <li><Link href="/legal/dpa" className="hover:text-white transition-colors">DPA</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Yhteys</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Tuki</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>support@converto.fi</li>
              <li>+358 ...</li>
              <li><a href="https://linkedin.com/company/converto" className="hover:text-white transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Converto Oy. Kaikki oikeudet pidätetään.
        </p>
      </div>
    </footer>
  );
}
