import Link from 'next/link';
import { MarketingRoiCalculator } from '@/components/MarketingRoiCalculator';

/* -------------------------------------------------------------------------- */
/*                                FINNISH PAGE                                */
/* -------------------------------------------------------------------------- */

export function HomeFi() {
  return (
    <main lang="fi">
      <NavbarFi />
      <HeroFi />
      <TrustBadgesFi />
      <WhyFi />
      <HowItWorksFi />
      <FeaturesFi />
      <SecurityFi />
      <ReferencesFi />
      <PricingFi />
      <IntegrationsFi />
      <TechFi />
      <FAQFi />
      <ROIFi />
      <CTAFi />
      <FooterFi />
    </main>
  );
}

function NavbarFi() {
  return (
    <nav className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/fi" className="text-xl font-extrabold text-slate-900">
          DocFlow
        </Link>
        <ul className="hidden items-center gap-6 md:flex">
          <li>
            <Link href="/fi/pricing" className="text-slate-600 transition-colors hover:text-slate-900">
              Hinnasto
            </Link>
          </li>
          <li>
            <Link href="/fi/integrations" className="text-slate-600 transition-colors hover:text-slate-900">
              Integraatiot
            </Link>
          </li>
          <li>
            <Link href="/fi/security" className="text-slate-600 transition-colors hover:text-slate-900">
              Tietoturva
            </Link>
          </li>
          <li>
            <Link href="/fi/contact" className="text-slate-600 transition-colors hover:text-slate-900">
              Yhteys
            </Link>
          </li>
          <li>
            <Link
              href="/fi/signup"
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Kokeile ilmaiseksi
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function HeroFi() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:flex lg:items-center lg:gap-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Vähemmän manuaalia. Enemmän liiketoimintaa.</h1>
          <p className="mt-5 text-lg text-slate-600">
            DocFlow automatisoi kuittien ja ostolaskujen käsittelyn. Integraatiot Netvisoriin, Procountoriin ja
            Vero.fi‑lähetys – ilman järjestelmävaihtoa.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/fi/signup" className="rounded-md bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700">
              Aloita ilmainen 30 päivän kokeilu
            </Link>
            <Link href="/fi/demo" className="rounded-md border border-slate-300 px-5 py-3 text-slate-800 hover:bg-slate-50">
              Varaa 15 min demo
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Ei luottokorttia. Peru milloin tahansa. EU‑palvelimet. GDPR‑yhteensopiva.</p>
        </div>
        <div className="mt-12 flex-1 lg:mt-0">
          <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm">
            <div className="text-center">
              <div className="mb-4 text-6xl">📄</div>
              <div className="text-lg font-semibold text-slate-700">DocFlow Demo</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadgesFi() {
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
          {items.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2">
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-sm text-slate-700">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyFi() {
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
          {items.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksFi() {
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
          {steps.map((step) => (
            <div key={step.step} className="rounded-xl border border-slate-200 p-6">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-center text-white leading-10">{step.step}</div>
              <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">Keskimäärin 3,1 s / dokumentti.</p>
      </div>
    </section>
  );
}

function FeaturesFi() {
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
          {list.map(([title, description]) => (
            <div key={title} className="rounded-xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecurityFi() {
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
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ReferencesFi() {
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
          {cases.map((customer) => (
            <div key={customer.name} className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <p className="mt-2 text-slate-700">{customer.result}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingFi() {
  const plans = [
    {
      name: 'Starter',
      price: '149 €',
      period: '/kk',
      who: 'Toiminimet, 1–5 hlö',
      features: ['500 dokumenttia/kk', 'Perus‑OCR', '1 integraatio', 'Mobiili', 'Email‑tuki'],
      cta: '/fi/signup?plan=starter',
    },
    {
      name: 'Business',
      price: '299 €',
      period: '/kk',
      who: '5–50 hlö',
      features: ['2 000 dokumenttia/kk', 'Advanced OCR', '2 integraatiota', 'Hyväksynnät', 'Monikielinen AI', 'Prioriteettituki'],
      cta: '/fi/signup?plan=business',
      highlight: true,
    },
    {
      name: 'Professional',
      price: '499 €',
      period: '/kk',
      who: '50–100 hlö',
      features: ['5 000 dokumenttia/kk', 'API & webhookit', 'Fraud‑esto', 'Vero.fi‑lähetys', 'SSO'],
      cta: '/fi/signup?plan=professional',
    },
  ];

  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Läpinäkyvät paketit. Ei yllätyksiä.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 shadow-sm ${plan.highlight ? 'border-blue-600' : 'border-slate-200'}`}
            >
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <span className="text-slate-500">{plan.who}</span>
              </div>
              <div className="mt-4 text-3xl font-extrabold">
                {plan.price} <span className="text-base font-medium text-slate-500">{plan.period}</span>
              </div>
              <ul className="mt-4 space-y-2 text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta}
                className={`mt-6 block rounded-md px-5 py-3 text-center ${
                  plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-slate-300 hover:bg-slate-50'
                }`}
              >
                Aloita ilmainen kokeilu
              </Link>
            </div>
          ))}
          <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="mt-2 text-slate-600">
              100+ hlö / tilitoimistot – Rajaamaton, BYO‑database/on‑prem, white‑label, SLA 99,9 %, oma yhteyshenkilö.
            </p>
            <Link href="/fi/contact?topic=enterprise" className="mt-6 block rounded-md border border-slate-300 px-5 py-3 text-center hover:bg-slate-50">
              Ota yhteyttä
            </Link>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Hinnat alv 0 %. Ylimenevät dokumentit 0,20 €/kpl tai automaattinen skaalaus.
        </p>
      </div>
    </section>
  );
}

function IntegrationsFi() {
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
          {integrations.map((integration) => (
            <div key={integration.name} className="flex items-center gap-2">
              <span className="text-2xl">{integration.icon}</span>
              <span className="text-lg font-semibold">{integration.name}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">Puuttuuko integraatio? Rakennamme 2–4 viikossa.</p>
      </div>
    </section>
  );
}

function TechFi() {
  const items = [
    'Next.js 15, React Server Components, Edge‑middleware',
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
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FAQFi() {
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
          {faqs.map(([question, answer]) => (
            <details key={question} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg font-semibold">{question}</span>
                <span className="text-slate-500 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-slate-700">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ROIFi() {
  return (
    <section className="bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-6 text-3xl font-bold">Laske, paljonko säästät</h2>
        <MarketingRoiCalculator />
      </div>
    </section>
  );
}

function CTAFi() {
  return (
    <section className="border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Valmis siirtymään automaatioon?</h2>
        <p className="mt-3 text-slate-600">
          Varaa 15 min demo tai aloita ilmainen kokeilu. Saat käyttöönoton 15 minuutissa ja tuen suomeksi.
        </p>
        <div className="mt-7 flex justify-center gap-4">
          <Link href="/fi/signup" className="rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
            Aloita ilmainen kokeilu
          </Link>
          <Link href="/fi/demo" className="rounded-md border border-slate-300 px-5 py-3 hover:bg-slate-50">
            Varaa demo
          </Link>
        </div>
      </div>
    </section>
  );
}

function FooterFi() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-semibold text-white">DocFlow by Converto</h3>
            <p className="mt-2 text-sm">
              Automatisoi dokumentit AI:lla
              <br />
              Turku, Finland
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-white">Tuote</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/fi/pricing" className="transition-colors hover:text-white">
                  Hinnasto
                </Link>
              </li>
              <li>
                <Link href="/fi/integrations" className="transition-colors hover:text-white">
                  Integraatiot
                </Link>
              </li>
              <li>
                <Link href="/fi/security" className="transition-colors hover:text-white">
                  Tietoturva
                </Link>
              </li>
              <li>
                <Link href="/fi/demo" className="transition-colors hover:text-white">
                  Demo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-white">Yritys</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/fi/legal/privacy" className="transition-colors hover:text-white">
                  Tietosuoja
                </Link>
              </li>
              <li>
                <Link href="/fi/legal/dpa" className="transition-colors hover:text-white">
                  DPA
                </Link>
              </li>
              <li>
                <Link href="/fi/contact" className="transition-colors hover:text-white">
                  Yhteys
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-white">Tuki</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>support@converto.fi</li>
              <li>+358 ...</li>
              <li>
                <a href="https://linkedin.com/company/converto" className="transition-colors hover:text-white">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-slate-500">© {new Date().getFullYear()} Converto Oy. Kaikki oikeudet pidätetään.</p>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 ENGLISH PAGE                               */
/* -------------------------------------------------------------------------- */

export function HomeEn() {
  return (
    <main lang="en">
      <NavbarEn />
      <HeroEn />
      <TrustBadgesEn />
      <WhyEn />
      <HowItWorksEn />
      <FeaturesEn />
      <SecurityEn />
      <ReferencesEn />
      <PricingEn />
      <IntegrationsEn />
      <TechEn />
      <FAQEn />
      <ROIEn />
      <CTAEn />
      <FooterEn />
    </main>
  );
}

function NavbarEn() {
  return (
    <nav className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/en" className="text-xl font-extrabold text-slate-900">
          DocFlow
        </Link>
        <ul className="hidden items-center gap-6 md:flex">
          <li>
            <Link href="/en/pricing" className="text-slate-600 transition-colors hover:text-slate-900">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/en/integrations" className="text-slate-600 transition-colors hover:text-slate-900">
              Integrations
            </Link>
          </li>
          <li>
            <Link href="/en/security" className="text-slate-600 transition-colors hover:text-slate-900">
              Security
            </Link>
          </li>
          <li>
            <Link href="/en/contact" className="text-slate-600 transition-colors hover:text-slate-900">
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/en/signup"
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Try for free
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function HeroEn() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:flex lg:items-center lg:gap-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Less manual work. More business impact.</h1>
          <p className="mt-5 text-lg text-slate-600">
            DocFlow automates receipts and purchase invoices. Native integrations to Netvisor, Procountor and direct VAT
            filing to Vero.fi – without ripping out your current systems.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/en/signup" className="rounded-md bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700">
              Start a 30-day free trial
            </Link>
            <Link href="/en/demo" className="rounded-md border border-slate-300 px-5 py-3 text-slate-800 hover:bg-slate-50">
              Book a 15 min demo
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">No credit card. Cancel anytime. EU hosting. Fully GDPR compliant.</p>
        </div>
        <div className="mt-12 flex-1 lg:mt-0">
          <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm">
            <div className="text-center">
              <div className="mb-4 text-6xl">📄</div>
              <div className="text-lg font-semibold text-slate-700">DocFlow Demo</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadgesEn() {
  const items = [
    { label: 'EU Hosting', icon: '🇪🇺' },
    { label: 'GDPR compliant', icon: '🔒' },
    { label: 'Suomi.fi ready', icon: '🇫🇮' },
    { label: '99.9% SLA', icon: '⚡' },
    { label: 'Bank-grade security', icon: '🛡️' },
  ];

  return (
    <section className="bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-center gap-6 opacity-90">
          {items.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2">
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-sm text-slate-700">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyEn() {
  const items = [
    {
      title: 'AI + OCR capture',
      desc: 'Supplier, VAT ID, totals and references recognised automatically. Learns from corrections and improves accuracy daily.',
    },
    {
      title: 'Deep integrations',
      desc: 'One-click sync to Netvisor, Procountor, Holvi, Zervant and more. Direct VAT filing via Suomi.fi authorization.',
    },
    {
      title: 'Go live in 15 minutes',
      desc: 'Runs on top of your current processes and accounting software. No migration project required.',
    },
  ];

  return (
    <section className="border-t border-slate-100 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Why DocFlow?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksEn() {
  const steps = [
    {
      step: '1',
      title: 'Snap a photo or drop a PDF',
      desc: 'Mobile capture, email inbox, drag & drop or API upload.',
    },
    {
      step: '2',
      title: 'AI extracts & validates',
      desc: 'OCR with Finnish business registry checks, duplicate prevention and automatic enrichment.',
    },
    {
      step: '3',
      title: 'Export anywhere',
      desc: 'Sync to your ERP or accounting suite or send VAT filings straight to Vero.fi.',
    },
  ];

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Three steps to done</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="rounded-xl border border-slate-200 p-6">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-center text-white leading-10">{step.step}</div>
              <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">Average processing time 3.1 seconds per document.</p>
      </div>
    </section>
  );
}

function FeaturesEn() {
  const list = [
    ['Purchase invoices', 'AI fills every field, flags anomalies and runs approval flows automatically.'],
    ['Receipt automation', 'Mobile capture, VAT split, expense policies and per-employee approvals.'],
    ['Logistics docs', 'Line-level OCR, automatic pricing and invoicing workflows.'],
    ['VAT filing', 'Submit VAT reports directly from DocFlow via Suomi.fi authorization.'],
    ['Fraud prevention', 'Duplicate detection with fuzzy matching across references, totals and suppliers.'],
    ['Multilingual AI', 'Finnish, English and 8+ languages for both text and speech.'],
    ['Own your data', 'Run on Supabase/Postgres or bring your own database and region.'],
    ['APIs & webhooks', 'Connect to CRM, ERP or analytics with real-time events.'],
  ];

  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Everything you need – minus the busywork</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {list.map(([title, description]) => (
            <div key={title} className="rounded-xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecurityEn() {
  const items = [
    'EU hosting (Supabase EU-West, Vercel EU regions)',
    'Encryption in transit & at rest (TLS 1.2+, AES-256)',
    'Row Level Security, granular roles, full audit trail',
    'Ready-made DPA/DPIA templates',
    '10-year retention to comply with Finnish accounting law',
    'SOC 2 Type II certification path underway',
  ];

  return (
    <section className="bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Bank-grade security with GDPR by design</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ReferencesEn() {
  const cases = [
    {
      name: 'Construction company, 28 employees',
      result: '45h → 6h per month saved. “VAT mistakes disappeared.”',
    },
    {
      name: 'Logistics company, 70 employees',
      result: 'Automated freight documents & invoicing. €4,500/month saved.',
    },
    {
      name: 'IT consultancy, 12 employees',
      result: 'Receipts + approvals automated. €1,150/month saved. “Mobile app is a lifesaver.”',
    },
  ];

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Proven results in 2–8 weeks</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cases.map((customer) => (
            <div key={customer.name} className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <p className="mt-2 text-slate-700">{customer.result}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingEn() {
  const plans = [
    {
      name: 'Starter',
      price: '€149',
      period: '/month',
      who: 'Micro businesses (1–5 people)',
      features: ['500 documents/month', 'Core OCR automation', '1 integration', 'Mobile capture', 'Email support'],
      cta: '/en/signup?plan=starter',
    },
    {
      name: 'Business',
      price: '€299',
      period: '/month',
      who: 'Teams of 5–50',
      features: ['2,000 documents/month', 'Advanced OCR', '2 integrations', 'Approval flows', 'Multilingual AI', 'Priority support'],
      cta: '/en/signup?plan=business',
      highlight: true,
    },
    {
      name: 'Professional',
      price: '€499',
      period: '/month',
      who: '50–100 people',
      features: ['5,000 documents/month', 'APIs and webhooks', 'Fraud prevention', 'Direct VAT filing', 'SSO'],
      cta: '/en/signup?plan=professional',
    },
  ];

  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Transparent pricing with rapid ROI</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 shadow-sm ${plan.highlight ? 'border-blue-600' : 'border-slate-200'}`}
            >
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <span className="text-slate-500">{plan.who}</span>
              </div>
              <div className="mt-4 text-3xl font-extrabold">
                {plan.price} <span className="text-base font-medium text-slate-500">{plan.period}</span>
              </div>
              <ul className="mt-4 space-y-2 text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta}
                className={`mt-6 block rounded-md px-5 py-3 text-center ${
                  plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-slate-300 hover:bg-slate-50'
                }`}
              >
                Start free trial
              </Link>
            </div>
          ))}
          <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="mt-2 text-slate-600">
              Unlimited documents, BYO database/on-prem, white-label option, 99.9% SLA and dedicated success manager.
            </p>
            <Link href="/en/contact?topic=enterprise" className="mt-6 block rounded-md border border-slate-300 px-5 py-3 text-center hover:bg-slate-50">
              Talk to us
            </Link>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">Prices exclude VAT. Overage billing €0.20/document or automatic scaling.</p>
      </div>
    </section>
  );
}

function IntegrationsEn() {
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
        <h2 className="text-3xl font-bold">Plays nicely with your finance stack</h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 opacity-80">
          {integrations.map((integration) => (
            <div key={integration.name} className="flex items-center gap-2">
              <span className="text-2xl">{integration.icon}</span>
              <span className="text-lg font-semibold">{integration.name}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">Missing an integration? We ship new connectors within 2–4 weeks.</p>
      </div>
    </section>
  );
}

function TechEn() {
  const items = [
    'Next.js 15, React Server Components and Edge middleware',
    'Supabase (Postgres, Auth, RLS) with Redis cache',
    'Vercel (ISR, CDN), Sentry monitoring, Resend email',
    'ML pipeline with ensemble OCR and continuous learning',
    'API-first architecture with REST and webhooks',
  ];

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Modern, scalable and battle-tested stack</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FAQEn() {
  const faqs = [
    ['Do we need to replace Netvisor or Procountor?', 'No. DocFlow reduces manual work while keeping your accounting untouched.'],
    ['Is sending VAT filings via DocFlow allowed?', 'Yes. We use Suomi.fi authorisation and the official Vero.fi API.'],
    ['How is security handled?', 'EU data residency, RLS, encryption, audit trail and DPA templates. Enterprise includes BYO database/on-prem.'],
    ['What ROI can we expect?', 'Teams typically save 20–70%. Use the ROI calculator below to estimate your case.'],
  ];

  return (
    <section className="border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Common questions</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg font-semibold">{question}</span>
                <span className="text-slate-500 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-slate-700">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ROIEn() {
  return (
    <section className="bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Calculate your savings</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-slate-600">Interactive ROI calculator launching soon.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <span className="text-sm">Current manual cost</span>
                <span className="text-lg font-semibold">€2,000/mo</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <span className="text-sm">DocFlow subscription</span>
                <span className="text-lg font-semibold">€299/mo</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-emerald-50 p-3 text-emerald-700">
                <span className="text-sm">Monthly savings</span>
                <span className="text-lg font-semibold">€1,701/mo</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <span className="text-sm">Annual savings</span>
                <span className="text-lg font-semibold">€20,412/yr</span>
              </div>
            </div>
            <Link href="/en/signup" className="mt-6 block rounded-md bg-blue-600 px-5 py-3 text-center text-white hover:bg-blue-700">
              Start free trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTAEn() {
  return (
    <section className="border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Ready to automate your financial ops?</h2>
        <p className="mt-3 text-slate-600">
          Book a 15 minute walkthrough or jump straight into a free trial. Onboarding takes 15 minutes and support is
          available in Finnish and English.
        </p>
        <div className="mt-7 flex justify-center gap-4">
          <Link href="/en/signup" className="rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
            Start free trial
          </Link>
          <Link href="/en/demo" className="rounded-md border border-slate-300 px-5 py-3 hover:bg-slate-50">
            Book a demo
          </Link>
        </div>
      </div>
    </section>
  );
}

function FooterEn() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-semibold text-white">DocFlow by Converto</h3>
            <p className="mt-2 text-sm">
              Automate financial documents with AI
              <br />
              Turku, Finland
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-white">Product</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/en/pricing" className="transition-colors hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/en/integrations" className="transition-colors hover:text-white">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/en/security" className="transition-colors hover:text-white">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/en/demo" className="transition-colors hover:text-white">
                  Demo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-white">Company</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/en/legal/privacy" className="transition-colors hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/en/legal/dpa" className="transition-colors hover:text-white">
                  DPA
                </Link>
              </li>
              <li>
                <Link href="/en/contact" className="transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-white">Support</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>support@converto.fi</li>
              <li>+358 ...</li>
              <li>
                <a href="https://linkedin.com/company/converto" className="transition-colors hover:text-white">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Converto Oy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

