export const dynamic = 'force-dynamic';

import Hero from "@/components/Hero"
import Problem from "@/components/Problem"
import Solution from "@/components/Solution"
import CTA from "@/components/CTA"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

export const metadata = {
  title: "CRM & Data Integration - +80% tuottavuus / 3 kk ROI",
  description: "Supabase / Notion / Salesforce synkronointi. Tietojen synkronointi ja automaattiset raportit.",
}

export default function CRMIntegrationPage() {
  return (
    <>
      <Navbar />
      <Hero title="CRM & Data Integration - +80% tuottavuus" subtitle="Supabase / Notion / Salesforce synkronointi" ctaPrimary={{ label: "Pyydä tarjous", href: "#contact" }} />
      <Problem title="Tieto on hajallaan eri järjestelmissä" bullets={["Manuaalinen tietojen siirto", "Ei reaaliaikaista päivitystä", "Raportit puuttuvat"]} />
      <Solution
        title="Ratkaisu: Tietojen synkronointi"
        items={[
          { feature: "Tietojen synkronointi", benefit: "Automaattinen tietojen siirto", savings: "Säästö: 600€/kk", icon: "🔄" },
          { feature: "Reaaliaikainen päivitys", benefit: "Ajan tasalla oleva data", savings: "Säästö: 400€/kk", icon: "⚡" },
          { feature: "Automaattiset raportit", benefit: "Ei manuaalista raportointia", savings: "ROI: +80%", icon: "📊" }
        ]}
      />
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Hinnoittelu</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Setup</h3>
              <div className="text-4xl font-bold mb-4">2000€</div>
            </div>
            <div className="p-8 bg-white rounded-2xl border-2 border-blue-500 bg-blue-50">
              <h3 className="text-2xl font-bold mb-4">Ylläpito</h3>
              <div className="text-4xl font-bold mb-4">200€<span className="text-lg text-gray-600">/kk</span></div>
              <div className="text-sm text-green-600 font-semibold">ROI: 3 kk</div>
            </div>
          </div>
        </div>
      </section>
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="mailto:hello@converto.fi?subject=CRM Integration - Tarjouspyyntö" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Lähetä sähköpostia →
          </Link>
        </div>
      </section>
      <CTA title="Tai kokeile Business OS:ta ilmaiseksi" subtitle="30 päivää ilmaiseksi" ctaLabel="Aloita pilotti →" href="/business-os/pilot" />
      <Footer />
    </>
  )
}
