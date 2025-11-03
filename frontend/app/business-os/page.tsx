import Hero from "@/components/Hero"
import Problem from "@/components/Problem"
import Solution from "@/components/Solution"
import CTA from "@/components/CTA"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

export const metadata = {
  title: "Converto Business OS™ – Automatisoi koko yrityksesi",
  description:
    "Converto Business OS™ automatisoi kuittien käsittelyn, ALV-laskennan, raportoinnin ja asiakaspalvelun. Powered by Converto Solutions.",
}

export default function BusinessOSPage() {
  return (
    <>
      <Navbar />

      <Hero
        title="Converto Business OS™ - Automatisoi koko yrityksesi"
        subtitle="Powered by Converto Solutions. Automaattinen kuittien käsittely, ALV-laskelmat ja asiakaspalvelu. Yksi alusta kaikkeen."
        ctaPrimary={{ label: "Kokeile ilmaiseksi 30pv", href: "/business-os/pilot" }}
        ctaSecondary={{ label: "Katso palvelupaketit", href: "/services" }}
        image="/images/converto-hero.png"
      />

      <Problem
        title="Hajallaan oleva tieto, manuaaliset prosessit."
        bullets={[
          "Tieto on hajallaan Excelissä ja sähköposteissa",
          "Raportointi vie tunteja viikossa",
          "Asiakaspalvelu toistaa samoja vastauksia",
        ]}
      />

      <Solution
        title="Ratkaisu: Business OS automatisoi kaiken"
        items={[
          {
            feature: "OCR + ALV",
            benefit: "Vero.fi -integroitu automaattinen kuittien tunnistus ja ALV-erittely",
            savings: "Säästö: 8h/viikko",
            icon: "🧾"
          },
          {
            feature: "ChatService™",
            benefit: "GPT-5 -pohjainen asiakaspalvelu ja myyntibotit",
            savings: "Säästö: 2000€/kk",
            icon: "🤖"
          },
          {
            feature: "Automation",
            benefit: "Prosessien automaatio ja workflowt",
            savings: "ROI: 3-5x",
            icon: "⚡"
          }
        ]}
      />
      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Miksi valita Business OS?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm text-center">
              <div className="text-5xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold mb-2">Säästö: 8h/viikko</h3>
              <p className="text-gray-600">Automatisoi manuaaliset prosessit</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Riski: 0 verovirhettä</h3>
              <p className="text-gray-600">Vero.fi -integroitu tarkkuus</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm text-center">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-2">ROI: 3-5x</h3>
              <p className="text-gray-600">Takaisinmaksuaika 3-6 kk</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Hinnoittelu</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border-2 border-gray-200 rounded-2xl">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-4">99€<span className="text-lg text-gray-600">/kk</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>OCR + ALV</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Perus-automaatio</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Email-tuki</span>
                </li>
              </ul>
              <Link
                href="/business-os/pilot"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Aloita ilmaiseksi
              </Link>
            </div>
            <div className="p-8 border-2 border-blue-500 rounded-2xl bg-blue-50">
              <div className="text-sm font-semibold text-blue-600 mb-2">SUOSITUS</div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-4">299€<span className="text-lg text-gray-600">/kk</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Kaikki Starter-ominaisuudet</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>ChatService™ Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Edistynyt automaatio</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Prioritoidut tuki</span>
                </li>
              </ul>
              <Link
                href="/business-os/pilot"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Aloita ilmaiseksi
              </Link>
            </div>
            <div className="p-8 border-2 border-gray-200 rounded-2xl">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-4">Custom</div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Kaikki Pro-ominaisuudet</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Räätälöity integraatiot</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Dedikoidut resurssit</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>SLA + 24/7 tuki</span>
                </li>
              </ul>
              <Link
                href="/services/consulting"
                className="block w-full text-center px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Pyydä tarjous
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTA
        title="Aloita ilmainen 30pv pilotti"
        subtitle="Ei korttitietoja - Peruuta milloin tahansa - Ensimmäiset 50 yritystä saavat 30 päivää ilmaiseksi"
        ctaLabel="Aloita pilotti →"
        href="/business-os/pilot"
      />

      <Footer />
    </>
  )
}
