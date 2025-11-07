"use client"

export default function PremiumFeatures(): JSX.Element {
  const features = [
    {
      icon: "📊",
      title: "Automaattinen laskutus",
      description: "Luo ja lähetä laskut automaattisesti. Seuraa maksuja ja lähetä muistutuksia.",
      benefits: ["Säästää 10h/viikko", "Vähentää myöhästyneitä maksuja 80%", "Automaattinen kirjanpito"]
    },
    {
      icon: "👥",
      title: "Asiakashallinta",
      description: "CRM-integraatio, automaattiset seurantaviestejä ja asiakastyytyväisyyden mittaaminen.",
      benefits: ["30% enemmän myyntiä", "Automaattiset seurantaviestejä", "Asiakasanalytiikka"]
    },
    {
      icon: "📈",
      title: "Raportointi ja analytiikka",
      description: "Reaaliaikaiset dashboardit, automaattiset raportit ja ennusteet.",
      benefits: ["Hetkellinen näkyvyys", "Automaattiset raportit", "Älykkäät ennusteet"]
    },
    {
      icon: "🤖",
      title: "AI-avusteinen automaatio",
      description: "Koneoppiminen oppii yrityksesi toimintatapoja ja ehdottaa uusia automaatioita.",
      benefits: ["Oppii toimintatapojasi", "Ehdottaa parannuksia", "Kehittyy jatkuvasti"]
    },
    {
      icon: "🔐",
      title: "Tietoturva ja yhteensopivuus",
      description: "GDPR-yhteensopiva, bank-tason salaus ja automaattiset varmuuskopiot.",
      benefits: ["GDPR-yhteensopiva", "Bank-tason salaus", "Automaattiset varmuuskopiot"]
    },
    {
      icon: "📱",
      title: "Mobiilisovellus",
      description: "Hallitse yritystäsi mistä tahansa. Reaaliaikaiset ilmoitukset ja nopeat toimenpiteet.",
      benefits: ["Mistään hallinta", "Push-ilmoitukset", "Offline-toiminta"]
    }
  ]

  return (
    <section className="premium-features" id="features">
      <div className="container">
        <div className="features-header">
          <h2 className="features-title">
            Kaikki mitä tarvitset yhdessä paikassa
          </h2>
          <p className="features-subtitle">
            Converto Business OS korvaa 10+ erillistä ohjelmistoa yhdellä älykkäällä järjestelmällä
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
              </div>
              <p className="feature-description">{feature.description}</p>
              <ul className="feature-benefits">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="benefit-item">
                    <span className="benefit-icon">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Integration Logos */}
        <div className="integrations">
          <h3 className="integrations-title">Yhdistää helposti</h3>
          <div className="integration-logos">
            <div className="integration-item">
              <div className="integration-logo">🏦</div>
              <span>Pankit</span>
            </div>
            <div className="integration-item">
              <div className="integration-logo">📧</div>
              <span>Gmail</span>
            </div>
            <div className="integration-item">
              <div className="integration-logo">📅</div>
              <span>Google Calendar</span>
            </div>
            <div className="integration-item">
              <div className="integration-logo">📊</div>
              <span>Excel</span>
            </div>
            <div className="integration-item">
              <div className="integration-logo">💼</div>
              <span>CRM-järjestelmät</span>
            </div>
            <div className="integration-item">
              <div className="integration-logo">📱</div>
              <span>WhatsApp</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="features-cta">
          <a href="#pricing" className="btn btn-primary btn-lg">
            Kokeile ilmaiseksi
          </a>
          <p className="cta-note">Aloita 5 minuutissa • Ei teknistä osaamista tarvita</p>
        </div>
      </div>
    </section>
  )
}
