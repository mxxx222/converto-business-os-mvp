export const metadata = {
  title: "Varaa demo – DocFlow by Converto",
  description: "Varaa 15 minuutin demo ja näe miten DocFlow automatisoi dokumenttien käsittelyn. Henkilökohtainen esittely suomeksi.",
};

import Link from 'next/link';

export default function DemoPage() {
  return (
    <main>
      <section className="bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">Varaa 15 min demo</h1>
            <p className="mt-4 text-lg text-slate-600">
              Henkilökohtainen esittely suomeksi. Näytämme miten DocFlow automatisoi juuri teidän prosessit.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold">Mitä demossa käymme läpi?</h2>
              <ul className="mt-4 space-y-3">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  <span>Kuittien ja ostolaskujen automaattinen käsittely</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  <span>Integraatiot Netvisoriin/Procountoriin</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  <span>Vero.fi-lähetys ja hyväksyntäprosessit</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  <span>Säästölaskuri juuri teidän tilanteeseen</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  <span>Käyttöönotto-ohje ja seuraavat askeleet</span>
                </li>
              </ul>

              <div className="mt-6 rounded-md bg-blue-50 p-4">
                <h3 className="font-semibold text-blue-900">Demo-tarjous</h3>
                <p className="mt-1 text-sm text-blue-800">
                  Varaa demo ja saat 50% alennuksen ensimmäisestä kuukaudesta + henkilökohtaisen käyttöönoton.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold">Calendly-integraatio</h2>
              <div className="mt-4 aspect-[4/3] rounded-md bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-slate-600">Calendly-kalenteri tulossa...</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Sillä välin, ota yhteyttä suoraan:
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm">📧 demo@converto.fi</p>
                    <p className="text-sm">📞 +358 ...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Ei ehdi demoon?{' '}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Aloita suoraan ilmainen kokeilu
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
