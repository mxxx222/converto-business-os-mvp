import Hero from "@/components/Hero"
import Problem from "@/components/Problem"
import CTA from "@/components/CTA"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export const metadata = {
  title: "Converto Business OS™ - Automatisoi yrityksesi",
  description: "Automatisoi yrityksesi Converto Business OS™ -palveluilla. OCR-kuittien käsittely, ALV-laskelmat, ChatService™ ja enemmän.",
}

export default function Page() {
  return (
    <>
      <Navbar />
      
      <Hero
        title="Converto Business OS™ - Automatisoi yrityksesi"
        subtitle="Automaattinen kuittien käsittely, ALV-laskelmat ja asiakaspalvelu. Yksi alusta kaikkeen. Valmis yrityksesi kasvuun."
        ctaPrimary={{ label: "Katso palvelut", href: "/business-os" }}
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

      {/* Services Overview Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Omat palvelumme</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Automatisoi yrityksesi yhdellä ratkaisulla
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🧾</div>
              <h3 className="font-semibold text-lg mb-2">OCR + Kuitit</h3>
              <p className="text-gray-600 text-sm">
                Automaattinen kuittien tunnistus ja ALV-erittely
              </p>
              <a href="/palvelut/ocr" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Lue lisää →
              </a>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🧮</div>
              <h3 className="font-semibold text-lg mb-2">VAT Calculator</h3>
              <p className="text-gray-600 text-sm">
                Automaattinen ALV-laskenta ja verotariffit
              </p>
              <a href="/palvelut/vat" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Lue lisää →
              </a>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-semibold text-lg mb-2">ChatService™</h3>
              <p className="text-gray-600 text-sm">
                GPT-5 asiakaspalvelu ja myyntibotit
              </p>
              <a href="/palvelut/chatservice" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Lue lisää →
              </a>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-semibold text-lg mb-2">Automation</h3>
              <p className="text-gray-600 text-sm">
                Prosessien automaatio ja workflowt
              </p>
              <a href="/palvelut/automaatio" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Lue lisää →
              </a>
            </div>
          </div>
        </div>
      </section>

      <CTA
        title="Liity pilottiin ja aloita ilmaiseksi"
        subtitle="Ensimmäiset 50 yritystä saavat 30 päivää maksutonta käyttöä."
        ctaLabel="Aloita pilotti →"
        href="https://pilot.converto.fi"
      />
      
      <Footer />
    </>
  )
}