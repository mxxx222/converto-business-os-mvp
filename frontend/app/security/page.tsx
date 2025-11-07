export const revalidate = 3600

import Link from 'next/link'

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header>
        <h1 className="text-4xl font-extrabold">Tietoturva & vaatimustenmukaisuus</h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-600">
          Pankkitason suojaus, EU‑isännöinti ja GDPR by design. Rakennettu taloushallinnon
          vaatimuksiin – audit‑lokit, säilytysajat ja DPA valmiina.
        </p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <SecurityCard
          icon="🇪🇺"
          title="EU‑isännöinti"
          body="Supabase EU‑West, Vercel EU‑edge. Data ei poistu EU‑alueelta. Palvelimet Frankfurtissa ja Amsterdamissa."
        />
        <SecurityCard
          icon="🔒"
          title="Salaus"
          body="TLS 1.2+ siirrossa, AES‑256 levossa. KMS‑hallinta ja avainten automaattinen kierto."
        />
        <SecurityCard
          icon="👥"
          title="RLS & roolit"
          body="Row Level Security, organisaatio‑ ja käyttäjäkohtaiset roolit, vahva auditointi kaikista toiminnoista."
        />
        <SecurityCard
          icon="📋"
          title="Säilytys & lokitus"
          body="Kirjanpitolain 10 vuoden säilytys, täydet audit‑lokit ja vastuuketju jokaisesta dokumentista."
        />
        <SecurityCard
          icon="📄"
          title="DPA & DPIA"
          body="Tietojenkäsittelysopimus (DPA) ja vaikutustenarviointi (DPIA) saatavilla. Juridinen tuki mukana."
        />
        <SecurityCard
          icon="🛡️"
          title="Sertifiointi"
          body="SOC 2 Type II ‑polku käynnissä – penetraatiotestit vuosittain. ISO 27001 -valmistelu."
        />
      </section>

      <section className="mt-14 rounded-xl border border-slate-200 p-8 bg-gradient-to-r from-blue-50 to-slate-50">
        <h2 className="text-2xl font-bold">BYO‑database / On‑prem</h2>
        <p className="mt-3 text-slate-700">
          Enterprise‑asiakkaat voivat käyttää omaa Supabase/Postgres‑instanssiaan (BYO) tai
          on‑prem‑asennusta, jolloin data ei koskaan poistu asiakkaan ympäristöstä.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">BYO Database</h3>
            <p className="mt-1 text-sm text-slate-600">
              Käytä omaa Supabase- tai Postgres-tietokantaa. DocFlow prosessoi, sinä omistat datan.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">On-Premise</h3>
            <p className="mt-1 text-sm text-slate-600">
              Täysi asennuspaketti omiin palvelimiin. Ei ulkoisia yhteyksiä, täysi kontrolli.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Vaatimustenmukaisuus</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ComplianceCard
            title="GDPR"
            desc="Täysi GDPR-yhteensopivuus. Tietosuojaseloste, DPA ja rekisteröidyn oikeudet."
            status="✅ Valmis"
          />
          <ComplianceCard
            title="Kirjanpitolaki"
            desc="10 vuoden säilytys, audit-lokit ja vastuuketju kirjanpitolain mukaisesti."
            status="✅ Valmis"
          />
          <ComplianceCard
            title="SOC 2 Type II"
            desc="Turvallisuus-, käytettävyys- ja luottamuksellisuusauditointi käynnissä."
            status="🔄 Käynnissä"
          />
        </div>
      </section>

      <section className="mt-14 rounded-xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold">Tietopyynnöt & GDPR‑oikeudet</h2>
        <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
          <li>Oikeus saada pääsy tietoihin (export JSON/CSV/PDF)</li>
          <li>Oikeus oikaista ja poistaa (self‑service tai pyyntö)</li>
          <li>Oikeus siirtää (täydet exportit asiakkaalle)</li>
          <li>Tietoturvaloukkausilmoitus 24 h sisällä</li>
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Tekninen arkkitehtuuri</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold">Infrastruktuuri</h3>
            <ul className="mt-3 space-y-2 text-slate-700">
              <li>• Supabase EU-West (Frankfurt)</li>
              <li>• Vercel Edge Network (EU)</li>
              <li>• Redis cache (EU-keskukset)</li>
              <li>• Sentry error tracking (EU)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold">Varmuuskopiot</h3>
            <ul className="mt-3 space-y-2 text-slate-700">
              <li>• Automaattiset päivittäiset varmuuskopiot</li>
              <li>• Point-in-time recovery 30 päivää</li>
              <li>• Geo-redundant storage</li>
              <li>• Testattavat palautusprosessit</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-14 text-center">
        <h2 className="text-2xl font-bold">Kysymyksiä tietoturvasta?</h2>
        <p className="mt-2 text-slate-600">
          Ota yhteyttä tietoturvatiimiin tai lataa DPA-pohja.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link 
            href="/legal/dpa" 
            className="rounded-md border border-slate-300 px-5 py-3 hover:bg-slate-50"
          >
            Lataa DPA‑pohja
          </Link>
          <Link 
            href="/contact?topic=security" 
            className="rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Ota yhteyttä
          </Link>
        </div>
      </section>
    </main>
  )
}

function SecurityCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <article className="rounded-xl border border-slate-200 p-6 bg-white shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-slate-700">{body}</p>
        </div>
      </div>
    </article>
  )
}

function ComplianceCard({ title, desc, status }: { title: string; desc: string; status: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm">{status}</span>
      </div>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  )
}
