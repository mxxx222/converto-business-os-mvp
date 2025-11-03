import Hero from "@/components/Hero"
import Plan from "@/components/Plan"
import CTA from "@/components/CTA"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

export const metadata = {
  title: "Automaatio- ja koodauspalvelut - 3 kk ROI",
  description: "Räätälöity automaatio ja koodauspalvelut yrityksellesi. 5 ROI-pakettia, jotka maksavat itsensä takaisin 3 kuukaudessa.",
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <Hero
        title="Automaatio- ja koodauspalvelut"
        subtitle="3 kk ROI -paketit, jotka maksavat itsensä takaisin. Räätälöity automaatio ja koodauspalvelut yrityksellesi."
        ctaPrimary={{ label: "Pyydä tarjous", href: "#contact" }}
        image="/images/converto-hero.png"
      />

      {/* 5 ROI-pakettia (Grid) */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Valitse oikea paketti</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Agent Setup */}
            <div className="p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 transition-colors">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-2">AI Agent Setup</h3>
              <p className="text-gray-600 mb-4">
                GPT-avusteiset virtuaaliassistentit
              </p>
              <div className="mb-4">
                <div className="text-3xl font-bold text-green-600">+200%</div>
                <div className="text-sm text-gray-600">tuottavuus / 3 kk ROI</div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>AI-agentit vastaavat 80% kysymyksistä</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>24/7 asiakaspalvelu</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Räätälöity koulutus</span>
                </li>
              </ul>
              <Link
                href="/services/ai-agents"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Lue lisää →
              </Link>
            </div>

            {/* Automation Suite */}
            <div className="p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 transition-colors">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2">Automation Suite</h3>
              <p className="text-gray-600 mb-4">
                Zapier / n8n / Notion / Stripe-automaatiot
              </p>
              <div className="mb-4">
                <div className="text-3xl font-bold text-green-600">+150%</div>
                <div className="text-sm text-gray-600">tuottavuus / 3 kk ROI</div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Workflow-automaatio</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Integraatiot (Stripe, Notion, jne.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Räätälöity automaatio</span>
                </li>
              </ul>
              <Link
                href="/services/automation"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Lue lisää →
              </Link>
            </div>

            {/* Next.js Web Launch */}
            <div className="p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 transition-colors">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-2xl font-bold mb-2">Next.js Web Launch</h3>
              <p className="text-gray-600 mb-4">
                Optimoitu verkkosivusto + CRM-liitännät
              </p>
              <div className="mb-4">
                <div className="text-3xl font-bold text-green-600">+100%</div>
                <div className="text-sm text-gray-600">tuottavuus / 3 kk ROI</div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>SEO-optimoitu sivusto</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>CRM-integrointi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Automaattinen päivitys</span>
                </li>
              </ul>
              <Link
                href="/services/web-dev"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Lue lisää →
              </Link>
            </div>

            {/* CRM & Data Integration */}
            <div className="p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 transition-colors">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold mb-2">CRM & Data Integration</h3>
              <p className="text-gray-600 mb-4">
                Supabase / Notion / Salesforce synkronointi
              </p>
              <div className="mb-4">
                <div className="text-3xl font-bold text-green-600">+80%</div>
                <div className="text-sm text-gray-600">tuottavuus / 3 kk ROI</div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Tietojen synkronointi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Reaaliaikainen päivitys</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Automaattiset raportit</span>
                </li>
              </ul>
              <Link
                href="/services/crm-integration"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Lue lisää →
              </Link>
            </div>

            {/* Converto Consulting */}
            <div className="p-8 border-2 border-blue-500 rounded-2xl bg-blue-50 col-span-full md:col-span-1">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-2">Converto Consulting</h3>
              <p className="text-gray-600 mb-4">
                Auditointi + prosessien AI-optimointi
              </p>
              <div className="mb-4">
                <div className="text-3xl font-bold text-green-600">+250%</div>
                <div className="text-sm text-gray-600">tuottavuus / 3 kk ROI</div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Prosessien auditointi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>AI-optimointi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Strateginen suunnittelu</span>
                </li>
              </ul>
              <Link
                href="/services/consulting"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Lue lisää →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <Plan
        title="Näin palvelut toimivat"
        steps={[
          { number: "1", text: "Auditointi: Analysoimme nykyiset prosessisi" },
          { number: "2", text: "Suunnittelu: Rakennamme räätälöidyn ratkaisun" },
          { number: "3", text: "Toteutus: Laadimme ja käynnistämme automaation" },
          { number: "4", text: "Seuranta: Seuraamme ROI:ta ja optimoimme" }
        ]}
      />

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Pyydä tarjous</h2>
          <p className="text-xl text-gray-600 mb-8">
            Kerro meille tarpeestasi, ja laadimme sinulle räätälöidyn tarjouksen.
          </p>
          <Link
            href="mailto:hello@converto.fi?subject=Palvelutiedustelu"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Lähetä sähköpostia →
          </Link>
        </div>
      </section>

      <CTA
        title="Tai kokeile Business OS:ta ilmaiseksi"
        subtitle="30 päivää ilmaiseksi - Ei korttitietoja - Peruuta milloin tahansa"
        ctaLabel="Aloita ilmainen pilotti →"
        href="/business-os/pilot"
      />

      <Footer />
    </>
  )
}
