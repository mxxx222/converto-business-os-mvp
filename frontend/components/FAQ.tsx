'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { CalendlyButton } from './CalendlyButton';

const faqs = [
  {
    question: 'Toimiiko Netvisorin ja Procountorin kanssa?',
    answer: 'Kyllä! Meillä on valmiit integraatiot molempiin. Käsitellyt dokumentit siirtyvät automaattisesti oikeille tileille ja ALV-käsittelyillä. Lisäksi tuemme Holvia, Zervanttia ja muita suosittuja järjestelmiä.'
  },
  {
    question: 'Kuinka tarkkaa OCR on suomalaisilla dokumenteilla?',
    answer: 'OCR-tarkkuutemme on 98%+ suomalaisilla laskuilla ja kuiteilla. Tunnistamme Y-tunnukset, IBAN-numerot, viitenumerot, eräpäivät ja ALV-tiedot automaattisesti. Epäselvissä tapauksissa voit aina tarkistaa ja korjata tulokset ennen tallennusta.'
  },
  {
    question: 'Paljonko tämä maksaa?',
    answer: '<strong>30 päivän ilmainen kokeilu - ei luottokorttia!</strong><br/><br/>Sen jälkeen:<br/>• <strong>Starter:</strong> €149/kk (500 dokumenttia/kk)<br/>• <strong>Business:</strong> €299/kk (2,000 dokumenttia/kk)<br/>• <strong>Professional:</strong> €499/kk (5,000 dokumenttia/kk)<br/>• <strong>Enterprise:</strong> Räätälöity hinnoittelu<br/><br/>Ei setup-maksuja. Peruuta milloin vain - ei kysymyksiä.'
  },
  {
    question: 'Onko datani turvassa?',
    answer: 'Kyllä. Kaikki data salataan AES-256-salauksella, tallennetaan EU:n alueelle (Supabase EU-West Frankfurt), ja noudatamme GDPR-vaatimuksia täysin. Sinulla on täysi kontrolli dataasi - voit viedä sen ulos tai poistaa milloin vain. Lisäksi teemme päivittäiset automaattiset varmuuskopiot.'
  },
  {
    question: 'Saammeko tukea ja koulutusta?',
    answer: 'Kyllä!<br/>• <strong>Live chat:</strong> Arkisin 9-17 (vastaus alle 5 min)<br/>• <strong>Email-tuki:</strong> Vastaus alle 4 tunnissa<br/>• <strong>Henkilökohtainen onboarding:</strong> 30min kickoff-puhelu<br/>• <strong>Video-oppaat:</strong> Step-by-step tutoriaalit<br/>• <strong>Dokumentaatio:</strong> Kattava help center<br/>• <strong>Puhelintuki:</strong> Professional & Enterprise -asiakkaille'
  },
  {
    question: 'Voimmeko testata ennen ostopäätöstä?',
    answer: 'Ehdottomasti! 30 päivän ilmainen kokeilu ilman luottokorttia. Saat täyden pääsyn kaikkiin ominaisuuksiin. Testaa rauhassa ja päätä sitten jatkavatko. Jos et ole tyytyväinen, peruuta yhdellä klikkauksella - ei kysymyksiä.'
  },
  {
    question: 'Kuinka nopeasti pääsemme alkuun?',
    answer: 'Instant! Rekisteröityminen vie 2 minuuttia. Sen jälkeen voit heti ladata ensimmäisen dokumentin ja nähdä OCR-tulokset. Netvisor/Procountor-integraatiot konfiguroidaan 15 minuutissa henkilökohtaisessa onboarding-puhelussa. Useimmat asiakkaat käsittelevät ensimmäisen dokumentin 10 minuutissa rekisteröitymisestä.'
  },
  {
    question: 'Toimiiko käsinkirjoitetuilla kuiteilla?',
    answer: 'Kyllä! OCR-moottori tunnistaa myös käsinkirjoitetun tekstin noin 85-90% tarkkuudella. Saatat joutua korjaamaan joitakin kenttiä, mutta se on silti paljon nopeampaa kuin syöttää kaikki manuaalisesti. Painetut kuitit tunnistuvat lähes 100% tarkkuudella.'
  },
  {
    question: 'Mitä tapahtuu 30 päivän kokeilun jälkeen?',
    answer: 'Saat muistutuksen 5 päivää ennen kokeilun päättymistä. Voit valita jatkavatko sopivalla paketilla tai peruuttaa. Jos et tee mitään, kokeilu päättyy automaattisesti - emme veloita mitään. Datasi säilyy 30 päivää jos haluat palata.'
  },
  {
    question: 'Voimmeko käyttää omaa pilvipalveluamme (BYO database)?',
    answer: 'Enterprise-tilauksella kyllä! Voit pitää datan omassa AWS/Azure/GCP-ympäristössäsi tai jopa on-premises-palvelimilla. Me tarjoamme vain käsittelylogiikan ja käyttöliittymän. Täydellinen ratkaisu suuryrityksille ja tilitoimistoille. Ota yhteyttä räätälöityyn tarjoukseen.'
  },
  {
    question: 'Tukeeko järjestelmä monta käyttäjää/tiimiä?',
    answer: 'Kyllä! Business-paketista alkaen voit lisätä useita käyttäjiä. Jokaisella on oma kirjautuminen ja näet kuka käsitteli minkäkin dokumentin. Enterprise-paketissa saat roolipohjaiset käyttöoikeudet (admin, controller, user) ja hyväksyntätyönkulut.'
  },
  {
    question: 'Mitä jos OCR epäonnistuu tai tekee virheen?',
    answer: 'Saat välittömän ilmoituksen jos OCR-varmuus on alle 90%. Voit sitten tarkistaa tulokset ja korjata virheet ennen tallennusta. Kaikki korjaukset tallentuvat ja järjestelmä oppii niistä (AI parantuu ajan kanssa). Lisäksi voit aina ladata alkuperäisen tiedoston.'
  },
  {
    question: 'Onko rajoituksia dokumenttien määrässä?',
    answer: 'Jokaisella paketilla on kuukausiraja (Starter 500, Business 2,000, Professional 5,000). Jos ylität rajan, voit joko päivittää pakettia tai maksat lisämaksun (€0.20/ylimääräinen dokumentti). Enterprise-paketissa ei ole rajoja - käsittele niin monta kuin tarvitset.'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">Kysymyksiä?</span>
        </div>
        <h2 className="text-4xl font-bold mb-4">
          ❓ Usein Kysytyt Kysymykset
        </h2>
        <p className="text-xl text-gray-600">
          Vastauksia yleisimpiin kysymyksiin
        </p>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`
              bg-white border-2 rounded-xl overflow-hidden transition-all duration-200
              ${openIndex === index 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }
            `}
          >
            {/* Question Button */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold text-lg pr-4 text-gray-900">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-6 h-6 text-blue-600 transition-transform duration-200 flex-shrink-0 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Answer */}
            {openIndex === index && (
              <div className="px-6 pb-5 border-t border-gray-100">
                <div 
                  className="pt-4 text-gray-700 leading-relaxed animate-in slide-in-from-top duration-200"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            📞 Eikö vastausta löytynyt?
          </h3>
          <p className="text-lg text-gray-600">
            Olemme täällä auttamassa! Vastaamme yleensä alle 4 tunnissa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:hello@docflow.fi"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all"
          >
            📧 Lähetä Sähköpostia
          </a>
          <CalendlyButton 
            variant="outline" 
            text="📅 Varaa Puhelu"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Vastaus alle 4h</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Arkisin 9-17</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Suomeksi & englanniksi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
