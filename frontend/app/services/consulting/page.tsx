export const dynamic = 'force-dynamic';

import Hero from "@/components/Hero"
import Problem from "@/components/Problem"
import Solution from "@/components/Solution"
import CTA from "@/components/CTA"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

export const metadata = {
  title: "Converto Consulting - +250% tuottavuus / 3 kk ROI",
  description: "Auditointi + prosessien AI-optimointi. Strateginen suunnittelu ja AI-optimointi.",
}

export default function ConsultingPage() {
  return (
    <>
      <Navbar />
      <Hero title="Converto Consulting - +250% tuottavuus" subtitle="Auditointi + prosessien AI-optimointi" ctaPrimary={{ label: "Pyydä tarjous", href: "#contact" }} />
      <Problem title="Prosessit eivät ole optimaaliset" bullets={["Ei selvää strategiaa", "AI:ta ei hyödynnetä", "Prosessit eivät skaalaa"]} />
      <Solution
        title="Ratkaisu: Strateginen konsultaatio"
        items={[
          { feature: "Prosessien auditointi", benefit: "Tunnistamme pullonkaulat", savings: "Säästö: 3000€/kk", icon: "🔍" },
          { feature: "AI-optimointi", benefit: "Integroimme AI:n prosesseihin", savings: "Säästö: 5000€/kk", icon: "🤖" },
          { feature: "Strateginen suunnittelu", benefit: "Luomme skaalautuvan strategian", savings: "ROI: +250%", icon: "📈" }
        ]}
      />
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Hinnoittelu</h2>
          <div className="text-4xl font-bold mb-4">10000€</div>
          <p className="text-gray-600 mb-8">Projektipohjainen, sisältää auditointin ja suunnittelun</p>
          <div className="text-sm text-green-600 font-semibold mb-8">ROI: 3 kk</div>
          <Link href="mailto:hello@converto.fi?subject=Converto Consulting - Tarjouspyyntö" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Lähetä sähköpostia →
          </Link>
        </div>
      </section>
      <CTA title="Tai kokeile Business OS:ta ilmaiseksi" subtitle="30 päivää ilmaiseksi" ctaLabel="Aloita pilotti →" href="/business-os/pilot" />
      <Footer />
    </>
  )
}
