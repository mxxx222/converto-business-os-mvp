'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { CalendlyButton } from './CalendlyButton';

interface FAQItem {
  question: string;
  answer: string;
  fear?: string; // Optional: what fear this addresses
}

const faqs: FAQItem[] = [
  {
    question: "Pelkään että integraatio on monimutkaista.",
    answer: "15 minuuttia. API-avain + 3 klikkausta. Ei koodia, ei IT-tukea. Näytämme videolla miten käy – alle minuutti.",
    fear: "complexity"
  },
  {
    question: "Entä jos AI tekee virheitä?",
    answer: "96-98% tarkkuus strukturoiduilla laskuilla. JA: Sinä hyväksyt jokaisen laskun ennen lähetystä. Ei robotteja ilman valvontaa. Sinä olet aina pomona.",
    fear: "trust"
  },
  {
    question: "Onko tämä liian kallista pienelle yritykselle?",
    answer: "Starter 149€/kk. Jos käsittelet 80 laskua, säästät 800€/kk. Takaisinmaksu 6 päivää. Kokeilu 30pv ilmainen – ei luottokorttia.",
    fear: "price"
  },
  {
    question: "Mitä jos DocFlow kaatuu ALV-ilmoituksen aikana?",
    answer: "99.9% uptime. EU-palvelimet. DPA-sopimus. JA: Data on aina saatavilla – voit ladata ja jatkaa manuaalisesti jos jotain ihmeellistä tapahtuu.",
    fear: "reliability"
  },
  {
    question: "Pitääkö Netvisor tai Procountor vaihtaa?",
    answer: "Ei. DocFlow toimii nykyisen taloushallintosi päällä API-integraatiolla. Kirjanpitoprosessisi pysyy ennallaan – poistat vain manuaalisen syöttötyön.",
    fear: "change"
  },
  {
    question: "Kuinka nopeasti pääsen alkuun?",
    answer: "15 min MVP: (1) Luo tili 5 min, (2) Yhdistä Netvisor 5 min, (3) Lähetä testilasku 5 min. Täysi tuotantokäyttö 1-2 päivää.",
    fear: "time"
  },
  {
    question: "Toimiiko käsinkirjoitettujen kuittien kanssa?",
    answer: "Kyllä, rajoitetusti. Summa ja päivämäärä tunnistuvat yleensä (70-85% tarkkuus). Huono käsiala tai rypistyneet kuitit haasteellisia. Parannettu OCR tulossa Q1 2026.",
    fear: "edge_cases"
  },
  {
    question: "Mitä tapahtuu kokeilun jälkeen?",
    answer: "30 päivän kokeilu päättyy automaattisesti – ei veloituksia. Voit jatkaa maksulliseen (data säilyy), päättää (90pv data-lataus), tai odottaa ilmaisversiota (Q1 2026).",
    fear: "commitment"
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
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full mb-4">
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">Huolia?</span>
        </div>
        <h2 className="text-4xl font-bold mb-4">
          🤔 Mikä estää sinua aloittamasta?
        </h2>
        <p className="text-xl text-gray-600">
          Vastaamme yleisimpiin kysymyksiin ja huoliin
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
              className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span 
                id={`faq-question-${index}`}
                className="font-bold text-lg pr-4 text-gray-900"
              >
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
              <div 
                id={`faq-answer-${index}`}
                className="px-6 pb-5 border-t border-gray-100"
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <div className="pt-4 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            💚 Valmis aloittamaan?
          </h3>
          <p className="text-lg text-gray-600">
            Useimmat huolet häviävät kun näet DocFlow:n toiminnassa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/demo"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-all text-lg"
          >
            📅 Varaa 15 min demo ja kysy mitä vain
          </a>
          <a
            href="/signup"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-700 transition-all text-lg"
          >
            🚀 Tai aloita suoraan ilmainen kokeilu
          </a>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✓</span>
            <span>30 päivää ilmaiseksi</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Ei luottokorttia</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Tuki suomeksi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
