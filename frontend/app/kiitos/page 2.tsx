"use client"

import { useEffect } from 'react'

export default function KiitosPage(): JSX.Element {
  useEffect(() => {
    // Analytics tracking
    fetch('/api/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'page_view', where: 'thank_you' })
    }).catch(() => {})
  }, [])

  return (
    <div className="kiitos-page">
      <div className="container">
        <div className="kiitos-content">
          {/* Success Icon */}
          <div className="success-icon">
            <div className="checkmark">
              <div className="checkmark-circle">
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="kiitos-title">
            Kiitos ilmoittautumisestasi! 🎉
          </h1>

          <p className="kiitos-subtitle">
            Olet nyt osa Converto Business OS -pilottiryhmää.
            Lähetämme sinulle ohjeet sähköpostitse muutaman minuutin kuluttua.
          </p>

          {/* Next Steps */}
          <div className="next-steps">
            <h2 className="steps-title">Seuraavat askeleet:</h2>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Tarkista sähköpostisi</h3>
                  <p>Lähetimme sinulle vahvistusviestin ja ohjeet aloittamiseen.</p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Luo tili</h3>
                  <p>Klikkaa linkkiä sähköpostissa ja luo Converto-tilisi.</p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Aloita automaatio</h3>
                  <p>Valitse automaatiot ja aloita säästämään aikaa heti.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Reminder */}
          <div className="benefits-reminder">
            <h3>Muistutus hyödyistä:</h3>
            <div className="benefits-grid">
              <div className="benefit">
                <span className="benefit-icon">⚡</span>
                <span>Aloita 5 minuutissa</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🛡️</span>
                <span>30 päivän takuu</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">💰</span>
                <span>Säästä €2,000+/kk</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">⏰</span>
                <span>Säästä 20+ tuntia/viikko</span>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="support-section">
            <h3>Tarvitsetko apua?</h3>
            <p>
              Jos sinulla on kysymyksiä tai tarvitset apua,
              ota yhteyttä asiakaspalveluun.
            </p>
            <div className="support-buttons">
              <a href="mailto:hello@converto.fi" className="btn btn-outline">
                Ota yhteyttä
              </a>
              <a href="/premium" className="btn btn-primary">
                Takaisin sivustolle
              </a>
            </div>
          </div>

          {/* Social Proof */}
          <div className="social-proof">
            <p className="proof-text">
              <strong>500+ yrittäjää</strong> on jo automatisoinut yrityksensä Converto Business OS:lla.
            </p>
            <div className="proof-avatars">
              <div className="avatar">👨‍💼</div>
              <div className="avatar">👩‍🎨</div>
              <div className="avatar">👨‍🚛</div>
              <div className="avatar">👩‍💻</div>
              <div className="avatar">👷‍♂️</div>
              <div className="avatar">+495</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
