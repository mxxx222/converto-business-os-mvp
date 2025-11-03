import Hero from "@/components/Hero"
import Problem from "@/components/Problem"
import Solution from "@/components/Solution"
import CTA from "@/components/CTA"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

export const metadata = {
  title: "Next.js Web Launch - +100% tuottavuus / 3 kk ROI",
  description: "Optimoitu verkkosivusto + CRM-liitännät. SEO-optimoitu ja automaattinen päivitys.",
}

export default function WebDevPage() {
  return (
    <>
      <Navbar />
      <Hero title="Next.js Web Launch - +100% tuottavuus" subtitle="Optimoitu verkkosivusto + CRM-liitännät" ctaPrimary={{ label: "Pyydä tarjous", href: "#contact" }} />
      <Problem title="Verkkosivusto ei tuota liidilähtöjä" bullets={["SEO ei toimi", "Ei CRM-integrointia", "Manuaalinen päivitys"]} />
      <Solution
        title="Ratkaisu: Optimoitu verkkosivusto"
        items={[
          { feature: "SEO-optimoitu", benefit: "Hakukoneoptimointi ja analytiikka", savings: "Säästö: 1000€/kk", icon: "🔍" },
          { feature: "CRM-integrointi", benefit: "Automaattinen liidien keräys", savings: "Säästö: 800€/kk", icon: "📊" },
          { feature: "Automaattinen päivitys", benefit: "Ei manuaalista ylläpitoa", savings: "ROI: +100%", icon: "⚡" }
        ]}
      />
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Hinnoittelu</h2>
          <div className="text-4xl font-bold mb-4">5000€</div>
          <p className="text-gray-600 mb-8">One-time -maksu, sisältää kaiken</p>
          <div className="text-sm text-green-600 font-semibold mb-8">ROI: 3 kk</div>
          <Link href="mailto:hello@converto.fi?subject=Next.js Web Launch - Tarjouspyyntö" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Lähetä sähköpostia →
          </Link>
        </div>
      </section>
      <CTA title="Tai kokeile Business OS:ta ilmaiseksi" subtitle="30 päivää ilmaiseksi" ctaLabel="Aloita pilotti →" href="/business-os/pilot" />
      <Footer />
    </>
  )
}
