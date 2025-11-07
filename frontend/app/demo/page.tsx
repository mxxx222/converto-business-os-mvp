export const revalidate = 3600

import Link from 'next/link'

export default function DemoPage() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/converto-demo/15min'

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold">Varaa 15 min demo</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
          Näytämme, miten DocFlow automatisoi ostolaskut, kuitit ja ALV‑ilmoitukset – ilman järjestelmävaihtoa.
        </p>
      </header>

      <section className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Valitse sopiva aika</h2>
            <div className="aspect-[16/12] w-full overflow-hidden rounded-lg border">
              <iframe
                title="DocFlow demo – Calendly"
                src={calendlyUrl}
                className="h-full w-full"
                frameBorder={0}
              />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Jos upotus ei näy, avaa{' '}
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                varauskalenteri uuteen ikkunaan
              </a>
              .
            </p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50">
            <h3 className="text-lg font-semibold mb-3">Mitä demo sisältää?</h3>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <span className="text-blue-600">📱</span>
                <span>Live‑OCR: kuitti → automaattinen kenttätäyttö</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600">🔗</span>
                <span>Integraatio Netvisoriin / Procountoriin</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600">🇫🇮</span>
                <span>ALV‑lähetys Vero.fi:hin (Suomi.fi‑valtuutus)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600">💰</span>
                <span>ROI‑laskelma teidän luvuilla</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600">❓</span>
                <span>Q&A ja räätälöinti teidän tarpeisiin</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-3">Demo-info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Kesto:</span>
                <span className="font-medium">15–20 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Formaatti:</span>
                <span className="font-medium">Zoom/Meet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Kieli:</span>
                <span className="font-medium">Suomi/English</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Hinta:</span>
                <span className="font-medium text-emerald-600">Ilmainen</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Valmistaudu demoon</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Mieti 2-3 esimerkkikuittia tai -laskua</li>
              <li>• Kerro nykyisestä taloushallintoprosessista</li>
              <li>• Listaa integraatiotarpeet (Netvisor, Procountor...)</li>
              <li>• Pohdi kuukausittaista dokumenttimäärää</li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">Tai aloita suoraan kokeilulla:</p>
            <Link
              href="/signup"
              className="inline-block rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 transition-colors"
            >
              Aloita ilmainen kokeilu
            </Link>
          </div>
        </aside>
      </section>

      <section className="mt-16 border-t border-slate-100 pt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Usein kysyttyä demoista</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold mb-2">Tarvitsenko valmistautua?</h3>
            <p className="text-slate-700 text-sm">
              Ei pakollista, mutta jos sinulla on esimerkkikuitteja tai -laskuja, voimme näyttää 
              live-käsittelyn omalla datallasi.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold mb-2">Voiko demon tallentaa?</h3>
            <p className="text-slate-700 text-sm">
              Kyllä, voimme tallentaa demon ja lähettää linkin jälkikäteen. Kerro tästä 
              varauksen yhteydessä.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold mb-2">Entä jos en pääse paikalle?</h3>
            <p className="text-slate-700 text-sm">
              Voit perua tai siirtää ajan Calendlyn kautta. Lähetämme myös muistutuksen 
              sähköpostilla päivää ennen.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold mb-2">Saanko hintatarjouksen?</h3>
            <p className="text-slate-700 text-sm">
              Kyllä, laskemme ROI:n yhdessä ja lähetämme räätälöidyn tarjouksen 
              demon jälkeen.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
