export const revalidate = 3600

import Link from 'next/link'

export default function IntegrationsPage() {
  const integrations = [
    {
      name: 'Netvisor',
      desc: 'Ostolaskut ja kuitit, tiliöintiehdotukset ja hyväksynnät. Lähetys yhdellä klikkauksella.',
      eta: 'Valmis',
      features: ['Ostolaskut', 'Kuitit', 'Tiliöinnit', 'Hyväksynnät']
    },
    {
      name: 'Procountor',
      desc: 'Ostolaskut, kulut ja hyväksyntäketjut. Yhteentoimivuus olemassa olevien prosessien kanssa.',
      eta: 'Valmis',
      features: ['Ostolaskut', 'Kulut', 'Hyväksynnät', 'Raportit']
    },
    {
      name: 'Vero.fi',
      desc: 'ALV‑ilmoitukset suoraan DocFlow\'sta Suomi.fi‑valtuutuksella. Täydet audit‑lokit.',
      eta: 'Beta',
      features: ['ALV-ilmoitukset', 'Suomi.fi valtuutus', 'Audit-lokit']
    },
    {
      name: 'Holvi',
      desc: 'Pienyrityksille: kuitit ja tositteet suoraan DocFlow\'sta Holviin.',
      eta: 'Valmis',
      features: ['Kuitit', 'Tositteet', 'Pienyrityksille']
    },
    {
      name: 'Zervant',
      desc: 'Freelancereille: myyntilaskut ja dokumenttien arkistointi.',
      eta: 'Valmis',
      features: ['Myyntilaskut', 'Arkistointi', 'Freelancerit']
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header>
        <h1 className="text-4xl font-extrabold">Integraatiot</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Toimii nykyisen taloushallintosi kanssa. Rakennamme uusia integraatioita 2–4 viikossa.
        </p>
      </header>

      <section className="mt-10">
        <div className="grid gap-6 md:grid-cols-2">
          {integrations.map((i) => (
            <article key={i.name} className="rounded-xl border border-slate-200 p-6 bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <span className="text-xl">🔗</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{i.name}</h2>
                  <span className={`inline-block rounded-full px-3 py-1 text-sm ${
                    i.eta === 'Valmis' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {i.eta}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-slate-700">{i.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {i.features.map((feature) => (
                  <span key={feature} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {feature}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
          <div className="mx-auto max-w-md">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold">Puuttuuko integraatio?</h3>
            <p className="mt-2 text-slate-600">
              Kerro tarpeesi – toteutamme 2–4 viikossa. Useimmat ERP- ja taloushallinto-ohjelmistot ovat tuettuja.
            </p>
            <Link
              href="/contact?topic=integration-request"
              className="mt-4 inline-block rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              Pyydä integraatiota
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-16 border-t border-slate-100 pt-16">
        <h2 className="text-2xl font-bold">Tekninen toteutus</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>🔒</span>
              Turvallinen yhteys
            </h3>
            <p className="mt-2 text-slate-700">
              Kaikki integraatiot käyttävät OAuth 2.0 tai API-avaimia. Salaus TLS 1.2+ ja audit-lokit kaikista siirroista.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>⚡</span>
              Reaaliaikainen synkronointi
            </h3>
            <p className="mt-2 text-slate-700">
              Dokumentit siirtyvät automaattisesti käsittelyn jälkeen. Webhookit ja API-kutsut varmistavat nopean päivityksen.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold">Valmis aloittamaan?</h2>
        <p className="mt-2 text-slate-600">
          Testaa integraatioita ilmaisessa kokeilussa – ei luottokorttia tarvita.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/signup" className="rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
            Aloita ilmainen kokeilu
          </Link>
          <Link href="/demo" className="rounded-md border border-slate-300 px-5 py-3 hover:bg-slate-50">
            Varaa demo
          </Link>
        </div>
      </section>
    </main>
  )
}
