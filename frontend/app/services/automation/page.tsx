import Hero from "@/components/Hero"
import Problem from "@/components/Problem"
import Solution from "@/components/Solution"
import Plan from "@/components/Plan"
import CTA from "@/components/CTA"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

export const metadata = {
  title: "Automation Suite - +150% tuottavuus / 3 kk ROI",
  description: "Zapier / n8n / Notion / Stripe-automaatiot. Workflow-automaatio ja integraatiot.",
}

export default function AutomationPage() {
  return (
    <>
      <Navbar />
      <Hero
        title="Automation Suite - +150% tuottavuus"
        subtitle="Zapier / n8n / Notion / Stripe-automaatiot. Automatisoi prosessisi ja säästä aikaa."
        ctaPrimary={{ label: "Pyydä tarjous", href: "#contact" }}
      />
      <Problem
        title="Manuaaliset prosessit vievät aikaa"
        bullets={["Toistuvat tehtävät vievät tunteja", "Virheet prosesseissa", "Integraatiot puuttuvat"]}
      />
      <Solution
        title="Ratkaisu: Workflow-automaatio"
        items={[
          { feature: "Workflow-automaatio", benefit: "Automatisoi toistuvat tehtävät", savings: "Säästö: 1500€/kk", icon: "⚡" },
          { feature: "Integraatiot", benefit: "Stripe, Notion, Supabase -synkronointi", savings: "Säästö: 800€/kk", icon: "🔗" },
          { feature: "Räätälöity", benefit: "Tehty juuri sinun tarpeisiisi", savings: "ROI: +150%", icon: "📋" }
        ]}
      />
      <Plan
        title="Näin toteutus tapahtuu"
        steps={[
          { number: "1", text: "Auditointi: Analysoimme prosessisi" },
          { number: "2", text: "Suunnittelu: Rakennamme workflowt" },
          { number: "3", text: "Toteutus: Käynnistämme automaation" }
        ]}
      />
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Hinnoittelu</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Setup</h3>
              <div className="text-4xl font-bold mb-4">3000€</div>
              <p className="text-gray-600">Workflow-automaatio ja integraatiot</p>
            </div>
            <div className="p-8 bg-white rounded-2xl border-2 border-blue-500 bg-blue-50">
              <h3 className="text-2xl font-bold mb-4">Ylläpito</h3>
              <div className="text-4xl font-bold mb-4">300€<span className="text-lg text-gray-600">/kk</span></div>
              <p className="text-gray-600 mb-4">Jatkuva optimointi ja tuki</p>
              <div className="text-sm text-green-600 font-semibold">ROI: 3 kk</div>
            </div>
          </div>
        </div>
      </section>
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Pyydä tarjous</h2>
          <Link href="mailto:hello@converto.fi?subject=Automation Suite - Tarjouspyyntö" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Lähetä sähköpostia →
          </Link>
        </div>
      </section>
      <CTA title="Tai kokeile Business OS:ta ilmaiseksi" subtitle="30 päivää ilmaiseksi" ctaLabel="Aloita pilotti →" href="/business-os/pilot" />
      <Footer />
    </>
  )
}
