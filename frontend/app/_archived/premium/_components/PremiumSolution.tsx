"use client"

export default function PremiumSolution(): JSX.Element {
  return (
    <section className="premium-solution" id="solution">
      <div className="container">
        <div className="solution-content">
          {/* Solution Headline - StoryBrand "Guide" */}
          <h2 className="solution-title">
            Converto Business OS on sinun henkilökohtainen automaatio-avustajasi
          </h2>

          <p className="solution-subtitle">
            Kuvittele, että sinulla olisi henkilökohtainen assistentti, joka hoitaa kaikki 
            rutiinitehtävät automaattisesti 24/7. Ei palkkoja, ei lomia, ei valituksia.
          </p>

          {/* Solution Features */}
          <div className="solution-features">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>Älykäs automaatio</h3>
              <p>AI-avusteinen järjestelmä oppii yrityksesi toimintatapoja ja automatisoi ne.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>5 minuutin setup</h3>
              <p>Yhdistä tilit, valitse automaatiot ja aloita säästämään aikaa saman päivän aikana.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Reaaliaikainen seuranta</h3>
              <p>Näe heti, kuinka paljon aikaa ja rahaa säästät automaation avulla.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Turvallinen ja luotettava</h3>
              <p>Bank-tason tietoturva ja 99.9% käytettävyys. Tietosi ovat turvassa.</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="how-it-works">
            <h3 className="how-title">Miten se toimii?</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Yhdistä tilit</h4>
                  <p>Liitä pankki, laskutus, CRM ja muut työkalut turvallisesti.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Valitse automaatiot</h4>
                  <p>Valitse valmiista malleista tai luo omat automaatioskenaariosi.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Aloita säästämään</h4>
                  <p>Järjestelmä hoitaa rutiinit automaattisesti. Sinä keskityt kasvuun.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Metrics */}
          <div className="success-metrics">
            <h3 className="metrics-title">Tulokset 30 päivässä</h3>
            <div className="metrics-grid">
              <div className="metric">
                <div className="metric-number">20+</div>
                <div className="metric-label">tuntia säästetty viikossa</div>
              </div>
              <div className="metric">
                <div className="metric-number">€2,000+</div>
                <div className="metric-label">kustannussäästö kuukaudessa</div>
              </div>
              <div className="metric">
                <div className="metric-number">95%</div>
                <div className="metric-label">vähemmän virheitä</div>
              </div>
              <div className="metric">
                <div className="metric-number">3x</div>
                <div className="metric-label">nopeampi kasvu</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="solution-cta">
            <a href="#pricing" className="btn btn-primary btn-lg">
              Aloita ilmaiseksi nyt
            </a>
            <p className="cta-note">Ei sitoumuksia • 14 päivän ilmainen kokeilu</p>
          </div>
        </div>
      </div>
    </section>
  )
}
