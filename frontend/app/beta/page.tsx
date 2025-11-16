import { BetaSignupForm } from '@/components/BetaSignupForm';
import { generateMetadata as generateSEOMetadata, pageSEO } from '@/lib/seo';

export const metadata = generateSEOMetadata(pageSEO.beta);

export default function BetaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <span className="font-medium">Vain 8 paikkaa jäljellä</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            DocFlow Beta-ohjelma
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Liity ensimmäisten joukkoon ja vaikuta DocFlow:n kehitykseen. 
            6 kuukautta ilmaiseksi + prioriteettituki suomeksi.
          </p>

          {/* Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: '💰',
                title: '6kk ilmaiseksi',
                description: 'Arvo €1 794'
              },
              {
                icon: '🎯',
                title: 'Prioriteettituki',
                description: 'Suomeksi, alle 2h'
              },
              {
                icon: '🚀',
                title: 'Early Access',
                description: 'Uudet ominaisuudet ensin'
              },
              {
                icon: '💬',
                title: 'Vaikuta kehitykseen',
                description: 'Viikoittainen feedback'
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories Preview */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            🏆 Beta-asiakkaiden tulokset
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                company: "Rakennusyritys, 28 hlö",
                result: "45h → 6h/kk",
                savings: "€2 900/kk säästö"
              },
              {
                company: "Kuljetus, 70 hlö", 
                result: "Duplikaatit loppuivat",
                savings: "€4 500/kk säästö"
              },
              {
                company: "IT-konsultointi, 12 hlö",
                result: "Mobiili on huikea",
                savings: "€1 150/kk säästö"
              }
            ].map((story, index) => (
              <div key={index} className="text-center">
                <div className="font-semibold text-green-900">{story.company}</div>
                <div className="text-gray-700 mb-1">{story.result}</div>
                <div className="font-bold text-green-600">{story.savings}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Beta Signup Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Hae Beta-ohjelmaan
            </h2>
            <p className="text-gray-600">
              Täytä alla oleva lomake ja otamme yhteyttä 1-2 arkipäivässä.
            </p>
          </div>
          
          <BetaSignupForm />
        </div>

        {/* Timeline */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-6 text-center">
            📅 Beta-ohjelma aikataulu
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                phase: "Viikko 1",
                title: "Kickoff & Setup",
                description: "15 min puhelu, käyttöoikeuden aktivointi, ensimmäiset testit"
              },
              {
                phase: "Viikko 2-4", 
                title: "Intensiivitestaus",
                description: "Päivittäinen käyttö, viikoittainen feedback, ominaisuuspyynnöt"
              },
              {
                phase: "Viikko 5-12",
                title: "Tuotantokäyttö", 
                description: "Täysi integraatio, automaatiot, mittausten seuranta"
              },
              {
                phase: "Viikko 13+",
                title: "Jatkuva kehitys",
                description: "Uudet ominaisuudet, pitkäaikainen kumppanuus"
              }
            ].map((phase, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  {index + 1}
                </div>
                <div className="font-semibold text-blue-900 mb-2">{phase.phase}</div>
                <div className="font-medium mb-2">{phase.title}</div>
                <div className="text-sm text-gray-600">{phase.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ for Beta */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6 text-center">
            ❓ Beta-ohjelma FAQ
          </h3>
          
          <div className="space-y-4">
            {[
              {
                q: "Mitä beta-ohjelma maksaa?",
                a: "Ei mitään! Saat 6 kuukautta täysin ilmaiseksi (arvo €1 794). Sen jälkeen voit jatkaa normaalihinnoin tai lopettaa."
              },
              {
                q: "Paljonko aikaa menee viikossa?",
                a: "15-30 minuuttia viikossa feedback-keskusteluihin. Päivittäinen käyttö on normaalia työtä joka säästää aikaa."
              },
              {
                q: "Mitä jos en ole tyytyväinen?",
                a: "Voit lopettaa milloin tahansa. Ei sitoutumista, ei maksuja. Data on aina sinun ja voit viedä sen ulos."
              },
              {
                q: "Saanko vaikuttaa ominaisuuksiin?",
                a: "Kyllä! Beta-asiakkaat päättävät mitkä ominaisuudet rakennamme seuraavaksi. Sinun äänesi kuuluu."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="font-semibold mb-2">{faq.q}</div>
                <div className="text-gray-700">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
