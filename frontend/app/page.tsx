import { HeroStoryBrand } from '@/components/HeroStoryBrand';
import { LandingSnippet } from '@/components/LandingSnippet';
import { SocialProof } from '@/components/SocialProof';
import { EnhancedROICalculator } from '@/components/EnhancedROICalculator';
import { FAQ } from '@/components/FAQ';
import { generateMetadata as generateSEOMetadata, generateStructuredData, pageSEO } from '@/lib/seo';

export const metadata = generateSEOMetadata(pageSEO.home);

export default function HomePage() {
  const faqSchema = generateStructuredData('faq', {
    faqs: [
      {
        question: "Pelkään että integraatio on monimutkaista.",
        answer: "15 minuuttia. API-avain + 3 klikkausta. Ei koodia, ei IT-tukea. Näytämme videolla miten käy – alle minuutti."
      },
      {
        question: "Entä jos AI tekee virheitä?",
        answer: "96-98% tarkkuus strukturoiduilla laskuilla. JA: Sinä hyväksyt jokaisen laskun ennen lähetystä. Ei robotteja ilman valvontaa. Sinä olet aina pomona."
      },
      {
        question: "Onko tämä liian kallista pienelle yritykselle?",
        answer: "Starter 149€/kk. Jos käsittelet 80 laskua, säästät 800€/kk. Takaisinmaksu 6 päivää. Kokeilu 30pv ilmainen – ei luottokorttia."
      }
    ]
  });

  return (
    <>
      {/* Structured Data for FAQ */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Hero Section with StoryBrand Framework */}
      <HeroStoryBrand />

      {/* Landing Snippet - Deployment CTA */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <LandingSnippet />
      </section>

      {/* Social Proof Section */}
      <SocialProof />

      {/* ROI Calculator Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <EnhancedROICalculator />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kaikki mitä tarvitset – ilman monimutkaisuutta
            </h2>
            <p className="text-xl text-gray-600">
              DocFlow hoitaa 80% työstä automaattisesti
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI + OCR Tunnistus',
                description: 'Tunnistaa toimittajan, Y-tunnuksen, summan, ALV:n ja eräpäivän 3-5 sekunnissa. 96-98% tarkkuus.'
              },
              {
                icon: '🔗',
                title: 'Suorat Integraatiot',
                description: 'Netvisor, Procountor, Holvi, Zervant. Yksi klikkaus, ei manuaalista syöttöä.'
              },
              {
                icon: '⚡',
                title: 'Nopea Käyttöönotto',
                description: '15 minuutissa käyttöön. Toimii nykyisten prosessiesi päällä – ei migraatiopakkoa.'
              },
              {
                icon: '🛡️',
                title: 'EU Tietoturva',
                description: 'GDPR by design, EU-palvelimet, pankkitason salaus. DPA-sopimus valmiina.'
              },
              {
                icon: '📱',
                title: 'Mobiilisovellus',
                description: 'Ota kuva kuitista puhelimella → automaattinen käsittely → Netvisoriin.'
              },
              {
                icon: '🎯',
                title: 'Hyväksyntäketjut',
                description: 'Summarajat, osastokohtaiset hyväksyjät, duplikaattien esto automaattisesti.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kolme askelta, valmis
            </h2>
            <p className="text-xl text-gray-600">
              Keskimäärin 3,1 s / dokumentti
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Ota kuva tai lähetä PDF',
                description: 'Mobiiliapp, sähköpostiohjaus, drag&drop tai API.',
                image: '📄'
              },
              {
                step: '2',
                title: 'AI käsittelee',
                description: 'OCR + tietotarkistus (Y-tunnus, viite, IBAN). Automaattinen kategorisointi.',
                image: '🤖'
              },
              {
                step: '3',
                title: 'Lähetä minne haluat',
                description: 'Netvisor/Procountor/ERP – tai suoraan Vero.fi:hin ALV-ilmoituksena.',
                image: '✅'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">{step.image}</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <FAQ />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Valmis siirtymään automaatioon?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Varaa 15 min demo tai aloita ilmainen kokeilu. Saat käyttöönoton 15 minuutissa ja tuen suomeksi.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              🚀 Aloita ilmainen kokeilu
            </a>
            <a
              href="/demo"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg border-2 border-blue-400 hover:bg-blue-800 transition-colors"
            >
              📅 Varaa demo
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-100">
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-400">✓</span>
              <span>30 päivää ilmaiseksi</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Ei luottokorttia</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Tuki suomeksi</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}