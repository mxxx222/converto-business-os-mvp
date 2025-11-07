"use client"

import { useState } from 'react'

export default function PremiumCTA(): JSX.Element {
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          name: '',
          company: '',
          source: 'premium_final_cta' 
        })
      })
      
      if (response.ok) {
        window.location.href = '/kiitos'
      }
    } catch (error) {
      console.error('Signup error:', error)
    }
  }

  return (
    <section className="premium-cta" id="pilot">
      <div className="container">
        <div className="cta-content">
          <div className="cta-header">
            <h2 className="cta-title">
              Valmista aloittamaan?
            </h2>
            <p className="cta-subtitle">
              Liity yli 500 yrittäjän joukkoon ja aloita automatisointi tänään.
            </p>
          </div>

          {/* Final CTA Form */}
          <form onSubmit={handleSubmit} className="cta-form">
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Syötä sähköpostiosoitteesi"
                className="form-input"
                required
              />
              <button type="submit" className="btn btn-primary btn-lg">
                Aloita ilmaiseksi nyt
              </button>
            </div>
            <p className="form-disclaimer">
              Ei sitoumuksia • 14 päivän ilmainen kokeilu • Peruuta milloin tahansa
            </p>
          </form>

          {/* Final Benefits */}
          <div className="final-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <span className="benefit-text">Aloita 5 minuutissa</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🛡️</span>
              <span className="benefit-text">30 päivän takuu</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <span className="benefit-text">Säästä €2,000+/kk</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">⏰</span>
              <span className="benefit-text">Säästä 20+ tuntia/viikko</span>
            </div>
          </div>

          {/* Urgency */}
          <div className="urgency-section">
            <div className="urgency-badge">🔥 Rajallinen tarjous</div>
            <p className="urgency-text">
              Ensimmäiset 100 asiakasta saavat 50% alennuksen ensimmäisestä vuodesta.
            </p>
          </div>

          {/* Social Proof */}
          <div className="social-proof-final">
            <div className="proof-text">
              <strong>500+ yrittäjää</strong> on jo automatisoinut yrityksensä.
            </div>
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
    </section>
  )
}
