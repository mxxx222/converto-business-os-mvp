import Hero from "@/components/Hero"
import ProductServiceGrid from "@/components/ProductServiceGrid"
import SocialProof from "@/components/SocialProof"
import ProblemDepth from "@/components/ProblemDepth"
import Solution from "@/components/Solution"
import Plan from "@/components/Plan"
import ROICalculator from "@/components/ROICalculator"
import PricingPreview from "@/components/PricingPreview"
import CTA from "@/components/CTA"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export const metadata = {
  title: "Converto Solutions – Automate your entire business stack",
  description: "Converto Solutions – Yksi brändi, kaikki ratkaisut. Business OS SaaS ja automaatio- ja koodauspalvelut. Automatisoi yrityksesi.",
}

export default function Page() {
  return (
    <>
      <Navbar />

      {/* 1. Hero (5 sekunnin arvo) */}
      <Hero
        title="Manuaalinen kirjanpito tuhlaa 10h/viikko"
        subtitle="Converto Solutions – Automate your entire business stack. Automatisoi 90% kirjanpitoprosesseista."
        ctaPrimary={{ label: "Kokeile Business OS:ta ilmaiseksi", href: "/business-os/pilot" }}
        ctaSecondary={{ label: "Katso palvelupaketit", href: "/services" }}
        image="/images/converto-hero.png"
      />

      {/* 2. Converto-branding - Tuote- ja palveluesittely */}
      <ProductServiceGrid />

      {/* 3. Social Proof */}
      <SocialProof
        companyCount={50}
        testimonials={[]}
      />

      {/* 4. Ongelma-syvyys (3-5 painopistettä) */}
      <ProblemDepth
        title="Manuaaliset prosessit maksavat enemmän kuin arvaat."
        items={[
          {
            category: "Kustannukset",
            title: "40% tuottavuudesta hukkaan",
            description: "Yritys menettää 40% tuottavuudesta manuaalisiin prosesseihin, jotka voisi automatisoida.",
            icon: "💰"
          },
          {
            category: "Riski",
            title: "Verovirheet maksavat tuhansia",
            description: "Virheet veroilmoituksissa maksavat 5000€+ ja voivat aiheuttaa veroviraston tarkastuksia.",
            icon: "⚠️"
          },
          {
            category: "Aika",
            title: "Kirjanpito vie päiviä",
            description: "Kirjanpito vie 2-3 päivää kuukaudessa, joka olisi paremmin käytetty kasvutoimintaan.",
            icon: "⏱️"
          }
        ]}
      />

      {/* 5. Ratkaisu-esittely (Feature → Benefit) */}
      <Solution
        title="Ratkaisu: Automatisoi koko stack"
        items={[
          {
            feature: "OCR + ALV",
            benefit: "Kuittien skannaus → Automaattinen ALV-erittely → Vero.fi -integroitu",
            savings: "Säästä 8h/viikko",
            icon: "🧾"
          },
          {
            feature: "VAT Calculator",
            benefit: "Tarkka ALV-laskenta → Ei verovirheitä → Ajan tasalla automaattisesti",
            savings: "Säästä 5000€/vuosi",
            icon: "🧮"
          },
          {
            feature: "ChatService™",
            benefit: "AI vastaa kysymyksiin → Ei yötöitä → GPT-5 -pohjainen",
            savings: "Säästä 2000€/kk",
            icon: "🤖"
          }
        ]}
      />

      {/* 6. Process (3 askelta) */}
      <Plan
        title="Näin aloitat"
        steps={[
          { number: "1", text: "Valitse ratkaisu (Business OS tai Services)" },
          { number: "2", text: "Saat pääsyn demo-ympäristöön heti" },
          { number: "3", text: "Aloita ilmainen pilotti tai projekti" }
        ]}
      />

      {/* 7. ROI-Laskuri (interaktiivinen) */}
      <ROICalculator />

      {/* 8. Pricing Preview */}
      <PricingPreview />

      {/* 9. Final CTA + Risk-Free */}
      <CTA
        title="Aloita ilmaiseksi 30pv tai pyydä tarjous palveluista"
        subtitle="30 päivää ilmaiseksi - Ei korttitietoja - Peruuta milloin tahansa"
        ctaLabel="Aloita nyt →"
        href="/business-os/pilot"
      />

      <Footer />
    </>
  )
}
