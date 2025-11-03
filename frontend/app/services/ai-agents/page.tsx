import Hero from "@/components/Hero"
import Problem from "@/components/Problem"
import Solution from "@/components/Solution"
import Plan from "@/components/Plan"
import CTA from "@/components/CTA"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

export const metadata = {
  title: "AI Agent Setup - +200% tuottavuus / 3 kk ROI",
  description: "GPT-avusteiset virtuaaliassistentit. AI-agentit vastaavat 80% kysymyksistä, 24/7 asiakaspalvelu.",
}

export default function AIAgentsPage() {
  return (
    <>
      <Navbar />

      <Hero
        title="AI Agent Setup - +200% tuottavuus"
        subtitle="GPT-avusteiset virtuaaliassistentit. Automatisoi asiakaspalvelusi ja vastaa kysymyksiin 24/7."
        ctaPrimary={{ label: "Pyydä tarjous", href: "#contact" }}
        image="/images/converto-hero.png"
      />

      <Problem
        title="Asiakaspalvelu vie aikaa ja resursseja"
        bullets={[
          "Samaa kysymystä vastataan toistuvasti",
          "Yötöitä tarvitaan 24/7-palveluun",
          "Henkilöstökustannukset kasvavat"
        ]}
      />

      <Solution
        title="Ratkaisu: AI-agentit automatisoi palvelun"
        items={[
          {
            feature: "80% kysymyksistä",
            benefit: "AI-agentit vastaavat automaattisesti yleisimpiin kysymyksiin",
            savings: "Säästö: 2000€/kk",
            icon: "🤖"
          },
          {
            feature: "24/7 palvelu",
            benefit: "Automaattinen asiakaspalvelu yötä päivää",
            savings: "Säästö: 5000€/vuosi",
            icon: "🕐"
          },
          {
            feature: "Räätälöity koulutus",
            benefit: "Koulutamme AI-agentit yrityksesi tarpeisiin",
            savings: "ROI: +200%",
            icon: "📚"
          }
        ]}
      />

      {/* Process Section */}
      <Plan
        title="Näin toteutus tapahtuu"
        steps={[
          { number: "1", text: "Setup: 2 viikkoa - Konfiguroimme AI-agentit" },
          { number: "2", text: "Koulutus: 1 viikko - Koulutamme AI:n tietoosi" },
          { number: "3", text: "Launch: 1 viikko - Käynnistämme palvelun" }
        ]}
      />

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Hinnoittelu</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Setup</h3>
              <div className="text-4xl font-bold mb-4">5000€</div>
              <p className="text-gray-600 mb-6">Yksilöllinen asennus ja konfigurointi</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>AI-agenttien konfigurointi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Tietojen koulutus</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Integraatiot</span>
                </li>
              </ul>
            </div>
            <div className="p-8 bg-white rounded-2xl border-2 border-blue-500 bg-blue-50">
              <h3 className="text-2xl font-bold mb-4">Ylläpito</h3>
              <div className="text-4xl font-bold mb-4">500€<span className="text-lg text-gray-600">/kk</span></div>
              <p className="text-gray-600 mb-6">Jatkuva optimointi ja tuki</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>AI-agenttien päivitys</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Analytiikka ja raportointi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Tekninen tuki</span>
                </li>
              </ul>
              <div className="text-sm text-green-600 font-semibold">ROI: 3 kk</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Pyydä tarjous</h2>
          <p className="text-xl text-gray-600 mb-8">
            Kerro meille tarpeestasi, ja laadimme sinulle räätälöidyn tarjouksen.
          </p>
          <Link
            href="mailto:hello@converto.fi?subject=AI Agent Setup - Tarjouspyyntö"
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
