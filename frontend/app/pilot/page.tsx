import Hero from "@/components/Hero"
import Problem from "@/components/Problem"
import Plan from "@/components/Plan"
import CTA from "@/components/CTA"
import PilotForm from "@/components/PilotForm"

export const metadata = {
  title: "Liity Converto Business OS™ Pilottiin - 30pv Ilmaiseksi",
  description: "Liity pilottiin ja saa 30 päivää maksutonta käyttöä. Automatisoi yrityksesi ilman riskiä. Ensimmäiset 50 yritystä.",
}

export default function PilotPage() {
  return (
    <>
      <Hero
        title="Liity Converto Business OS™ pilottiin."
        subtitle="Automatisoi yrityksesi ilman riskiä. Ensimmäiset 50 yritystä saavat käyttöönsä koko Business OS-järjestelmän ilmaiseksi 30 päiväksi."
        ctaPrimary={{ label: "Ilmoittaudu pilottiin", href: "#pilot" }}
        image="/images/converto-hero.png"
      />

      <Problem
        title="Manuaaliset prosessit maksavat enemmän kuin arvaat."
        bullets={[
          "Tieto on hajallaan Excelissä ja sähköposteissa",
          "Raportointi vie tunteja viikossa",
          "Asiakaspalvelu toistaa samoja vastauksia",
        ]}
      />

      <Plan
        title="Näin pilotointi toimii"
        steps={[
          { number: "1", text: "Täytä ilmoittautumislomake" },
          { number: "2", text: "Saat pääsyn demo-ympäristöön" },
          { number: "3", text: "30 päivää maksutonta käyttöä ja ROI-analyysi" },
        ]}
      />

      <section id="pilot" className="bg-gray-50 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <h2 className="text-3xl font-bold">Pilottiohjelma – ilmoittaudu nyt</h2>
          <PilotForm />
        </div>
      </section>

      <CTA
        title="Automatisoi yrityksesi tänään"
        subtitle="Converto Business OS™ säästää keskimäärin 40 % työajasta."
        ctaLabel="Aloita demo"
        href="https://app.converto.fi/demo"
      />
    </>
  )
}

