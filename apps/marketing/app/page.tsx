import Link from 'next/link';
import Image from 'next/image';
import HeroAB from '@/components/HeroAB';
import TrustBadges from '@/components/TrustBadges';
import { ROIForm } from '@/components/ROIForm';
import { PricingPlans } from '@/components/PricingPlans';

export const revalidate = 3600;

export default function HomePage() {
  return (
    <main>
      <HeroAB />
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
      <ROIForm />
      <CTA />
      <Footer />
    </main>
  );
}

function Why() {
  const items = [
    {
      title: 'Automaattinen OCR + AI',
      desc: 'Tunnistaa toimittajan, Y-tunnuksen, summan, ALV:n, viitenumeron ja eräpäivän. Oppii korjauksista - tarkkuus paranee joka päivä.',
    },
    {
      title: 'Suorat integraatiot',
      desc: 'Netvisor, Procountor, Holvi, Zervant - yksi klikkaus, ei manuaalista syöttöä. Vero.fi-lähetys suoraan (Suomi.fi-valtuutus).',
    },
    {
      title: 'Nopea käyttöönotto',
      desc: '15 minuutissa käyttöön. Ei migraatiopakkoa - DocFlow toimii nykyisten prosessien päällä.',
    },
  ];
  return (
    <section className="border-t border-slate-100 bg-slate-50/70">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">Miksi DocFlow?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-slate-600">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Ota kuva tai lähetä PDF',
      desc: 'Mobiiliapp, sähköpostiohjaus, drag & drop tai API.',
    },
    {
      step: '2',
      title: 'AI käsittelee',
      desc: 'OCR + tietotarkistus (Y-tunnus, viite, IBAN). Automaattinen kategorisointi ja hyväksyntäsäännöt.',
    },
    {
      step: '3',
      title: 'Lähetä minne haluat',
      desc: 'Netvisor/Procountor/ERP - tai suoraan Vero.fi:hin ALV-ilmoituksena.',
    },
  ];
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">Kolme askelta, valmis</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.step} className="rounded-2xl border border-slate-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                {step.step}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-slate-600">{step.desc}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">Keskimäärin 3,1 s / dokumentti.</p>
      </div>
    </section>
  );
}

function Features() {
  const list = [
    ['Ostolaskut', 'AI täyttää kentät, tunnistaa poikkeamat ja luo hyväksyntäketjut.'],
    ['Kuitit (ALV)', 'Mobiilikaappaus, ALV-erottelu, kululuokat ja työntekijäkohtaiset hyväksynnät.'],
    ['Rahtikirjat & tilausvahvistukset', 'OCR riveittäin, automaattinen hinnoittelu ja laskutus.'],
    ['Vero.fi', "ALV-ilmoitukset suoraan DocFlow'sta Suomi.fi-valtuutuksella."],
    ['Duplikaatit & petosesto', 'Fuzzy-haku viitteistä, summista ja toimittajista - varoitukset ennen maksua.'],
    ['Monikielinen AI', 'FI, EN, SV, RU, ET, SO, AR, UK, VI - puhe tai teksti, selkokieliset vastaukset.'],
    ['BYO Database', 'Omista datasi (Supabase/Postgres). DocFlow prosessoi, sinä päätät sijainnin.'],
    ['API & Webhookit', 'Kytke CRM/ERP/Raportointi. Tapahtumat reaaliajassa.'],
  ];
  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Kaikki mitä tarvitset - ilman monimutkaisuutta
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {list.map(([title, desc]) => (
            <article key={title} className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-slate-600">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    'EU-isännöinti (Supabase EU-West, Vercel EU)',
    'Salaus siirrossa ja levossa (TLS 1.2+, AES-256)',
    'Row Level Security, roolit ja audit-lokit',
    'DPA, DPIA - valmiit pohjat',
    '10 vuoden säilytys kirjanpitolain mukaan',
    'SOC 2 Type II -polku (sertifiointi käynnissä)',
  ];
  return (
    <section className="bg-slate-50/70">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Pankkitason tietoturva. EU-palvelimet. GDPR by design.
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-700">
              <span className="mt-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function References() {
  const cases = [
    {
      name: 'Rakennusyritys, 28 hlö',
      result: '45 h/kk → 6 h/kk, säästö €2 900/kk. “ALV-virheet nollaantuivat.”',
    },
    {
      name: 'Kuljetus, 70 hlö',
      result: 'Rahtikirjat + laskutusautomaatio, säästö €4 500/kk. “Duplikaatit loppuivat.”',
    },
    {
      name: 'IT-konsultointi, 12 hlö',
      result: 'Kuitit + hyväksynnät, säästö €1 150/kk. “Mobiili on huikea.”',
    },
  ];
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">Todistetut säästöt - 2-8 viikossa</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cases.map((item) => (
            <article key={item.name} className="rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
              <p className="mt-2 text-slate-700">{item.result}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Läpinäkyvät paketit. Ei yllätyksiä.</h2>
            <p className="mt-2 text-slate-600">
              Aloita ilmaisella kokeilulla ja päivitä, kun automaatio tuo mitattavan hyödyn.
            </p>
          </div>
          <Link
            href="/pricing"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Katso koko hinnasto →
          </Link>
        </div>
        <div className="mt-8">
          <PricingPlans />
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Hinnat alv 0 %. Ylimenevät dokumentit 0,20 €/kpl tai automaattinen skaalaus.
        </p>
      </div>
    </section>
  );
}

function Integrations() {
  const logos = ['netvisor', 'procountor', 'holvi', 'zervant', 'verofi'];
  return (
    <section className="bg-slate-50/70">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Toimii nykyisen taloushallintosi kanssa
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-6 opacity-80">
          {logos.map((logo) => (
            <Image
              key={logo}
              src={`/logos/${logo}.svg`}
              alt=""
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Puuttuuko integraatio? Rakennamme 2-4 viikossa.
        </p>
      </div>
    </section>
  );
}

function Tech() {
  const items = [
    'Next.js 14, React Server Components, Edge-middleware',
    'Supabase (Postgres, Auth, RLS), Redis-cache',
    'Vercel (ISR, CDN), Sentry, Resend',
    'ML-pipeline: multi-OCR ensemble, konsensus, jatkuva oppiminen',
    'API-ensimmäinen: REST + webhookit',
  ];
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">Moderni pino - skaalautuva ja testattu</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-700">
              <span className="mt-2 inline-block h-2 w-2 rounded-full bg-blue-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs: Array<[string, string]> = [
    [
      'Pitääkö Netvisor tai Procountor vaihtaa?',
      'Ei. DocFlow vähentää manuaalityötä, integraatiot pitävät kirjanpidon ennallaan.',
    ],
    [
      'Onko Vero.fi-lähetys sallittua?',
      'Kyllä. Käytämme Suomi.fi-valtuutusta ja Vero.fi:n julkista rajapintaa.',
    ],
    [
      'Miten tietoturva on toteutettu?',
      'EU-palvelimet, RLS, salaus, audit-lokit ja DPA. Enterprise-paketissa BYO-database tai on-prem.',
    ],
    [
      'Paljonko säästämme?',
      'Tyypillisesti 20-70 %. Laske tarkka säästö ROI-laskurilla alempana.',
    ],
  ];

  return (
    <section className="border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">Usein kysytyt</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg font-semibold text-slate-900">{question}</span>
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

function CTA() {
  return (
    <section className="border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Valmis siirtymään automaatioon?</h2>
        <p className="mt-3 text-slate-600">
          Varaa 15 min demo tai aloita ilmainen kokeilu. Saat käyttöönoton 15 minuutissa ja tuen
          suomeksi.
        </p>
        <div className="mt-7 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Aloita ilmainen kokeilu
          </Link>
          <Link
            href="/demo"
            className="rounded-md border border-slate-300 px-5 py-3 hover:bg-slate-50"
          >
            Varaa demo
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-white">Converto Oy</h3>
            <p className="mt-2 text-sm">
              DocFlow - Business OS
              <br />
              Turku, Suomi
            </p>
          </div>
          <div>
            <h4 className="text-white">Yritys</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/security">Tietoturva</Link>
              </li>
              <li>
                <Link href="/legal/dpa">DPA</Link>
              </li>
              <li>
                <Link href="/legal/privacy">GDPR</Link>
              </li>
              <li>
                <Link href="/status">Status</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white">Yhteys</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>support@converto.fi</li>
              <li>+358 ...</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white">Linkit</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/pricing">Hinnasto</Link>
              </li>
              <li>
                <Link href="/integrations">Integraatiot</Link>
              </li>
              <li>
                <Link href="/blog">Blogi</Link>
              </li>
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
