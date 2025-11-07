"use client"

import { useState } from 'react'

export default function PremiumFAQ(): JSX.Element {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    )
  }

  const faqs = [
    {
      question: "Kuinka nopeasti voin aloittaa?",
      answer: "Voit aloittaa 5 minuutissa! Yhdistä tilit, valitse automaatiot ja järjestelmä alkaa toimia heti. Ei teknistä osaamista tarvita."
    },
    {
      question: "Onko tietoni turvassa?",
      answer: "Kyllä! Käytämme bank-tason salausta ja olemme GDPR-yhteensopivia. Tietosi ovat turvassa ja kukaan muu ei pääse niihin käsiksi."
    },
    {
      question: "Mitä jos en ole tyytyväinen?",
      answer: "Tarjoamme 30 päivän rahat takaisin -takuun. Jos et ole 100% tyytyväinen, palautamme rahasi kokonaan. Ei kysymyksiä."
    },
    {
      question: "Kuinka paljon aikaa säästän?",
      answer: "Asiakkaamme säästävät keskimäärin 20+ tuntia viikossa. Jotkut säästävät jopa 40 tuntia viikossa rutiinitehtävien automatisointiin."
    },
    {
      question: "Tarvitsenko teknistä osaamista?",
      answer: "Ei! Converto on suunniteltu niin että kuka tahansa voi käyttää sitä. Valmiit mallit ja helppo setup tekevät siitä helppoa."
    },
    {
      question: "Mitä integraatioita tuette?",
      answer: "Tuemme yli 100 eri palvelua: pankit, Gmail, Google Calendar, Excel, CRM-järjestelmät, WhatsApp ja paljon muuta. Lista kasvaa jatkuvasti."
    },
    {
      question: "Voinko peruuttaa milloin tahansa?",
      answer: "Kyllä! Voit peruuttaa tilauksesi milloin tahansa. Ei sitoumuksia, ei piilotettuja maksuja. Peruuttaminen onnistuu yhdellä klikkauksella."
    },
    {
      question: "Onko tuki saatavilla?",
      answer: "Kyllä! Tarjoamme sähköpostitukea kaikille asiakkaille ja prioriteettitukea Professional- ja Enterprise-paketeissa. Vastausaika on alle 24h."
    },
    {
      question: "Voinko muuttaa pakettia myöhemmin?",
      answer: "Kyllä! Voit päivittää tai alentaa pakettiasi milloin tahansa. Muutokset tulevat voimaan seuraavasta laskutusjaksosta."
    },
    {
      question: "Miten automaatio oppii yritykseni toimintatapoja?",
      answer: "Käytämme AI-teknologiaa joka analysoi yrityksesi dataa ja oppii toimintatapojasi. Järjestelmä ehdottaa uusia automaatioita ja parantaa toimintaa jatkuvasti."
    }
  ]

  return (
    <section className="premium-faq" id="faq">
      <div className="container">
        <div className="faq-header">
          <h2 className="faq-title">
            Usein kysytyt kysymykset
          </h2>
          <p className="faq-subtitle">
            Vastaukset yleisimpiin kysymyksiin Converto Business OS:sta
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openItems.includes(index) ? 'open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => toggleItem(index)}
              >
                <span className="question-text">{faq.question}</span>
                <span className="question-icon">
                  {openItems.includes(index) ? '−' : '+'}
                </span>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-cta">
          <h3 className="cta-title">Löysitkö vastauksen kysymykseesi?</h3>
          <p className="cta-subtitle">
            Jos et löytänyt vastausta, ota yhteyttä asiakaspalveluun.
          </p>
          <div className="cta-buttons">
            <a href="mailto:hello@converto.fi" className="btn btn-outline">
              Ota yhteyttä
            </a>
            <a href="#pricing" className="btn btn-primary">
              Aloita ilmaiseksi
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
