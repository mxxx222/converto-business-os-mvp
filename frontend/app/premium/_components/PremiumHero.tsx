"use client"

import { useState } from 'react'

export default function PremiumHero(): JSX.Element {
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/pilot-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'premium_hero' })
      })

      if (response.ok) {
        // Success - redirect to thank you page
        window.location.href = '/kiitos'
      }
    } catch (error) {
      console.error('Signup error:', error)
    }
  }

  return (
    <section className="premium-hero">
      <div className="container">
        <div className="hero-content">
          {/* Hero Badge */}
          <div className="hero-badge">
            <span className="badge-text">🚀 Uusi tapa automatisoida yrityksesi</span>
          </div>

          {/* Main Headline - StoryBrand "Character" */}
          <h1 className="hero-title">
            Lopeta tylsä paperityö.<br />
            <span className="gradient-text">Aloita älykäs automaatio.</span>
          </h1>

          {/* Subheadline - StoryBrand "Problem" */}
          <p className="hero-subtitle">
            Converto Business OS automatisoi yrityksesi rutiinit, säästää 20+ tuntia viikossa
            ja tuplaa tuottavuutesi ilman teknistä osaamista.
          </p>

          {/* Social Proof */}
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Yritystä jo automatisoinut</div>
            </div>
            <div className="stat">
              <div className="stat-number">20h</div>
              <div className="stat-label">Säästetty viikossa</div>
            </div>
            <div className="stat">
              <div className="stat-number">95%</div>
              <div className="stat-label">Asiakastyytyväisyys</div>
            </div>
          </div>

          {/* CTA Form - StoryBrand "Call to Action" */}
          <form onSubmit={handleSubmit} className="hero-form">
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
                Aloita ilmaiseksi
              </button>
            </div>
            <p className="form-disclaimer">
              Ei sitoumuksia • 14 päivän ilmainen kokeilu • Peruuta milloin tahansa
            </p>
          </form>

          {/* Trust Indicators (EU-hosting • Tietoturva • SLA • Tuki 9–17) */}
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">🇪🇺</span>
              <span className="trust-text">EU‑hosting</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span className="trust-text">Tietoturva</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🛡️</span>
              <span className="trust-text">SLA saatavilla</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">📞</span>
              <span className="trust-text">Asiakastuki 9–17</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual">
          <div className="dashboard-preview">
            <div className="dashboard-header">
              <div className="dashboard-title">Converto Dashboard</div>
              <div className="dashboard-status">
                <span className="status-dot"></span>
                <span>Live</span>
              </div>
            </div>
            <div className="dashboard-content">
              <div className="metric-card">
                <div className="metric-label">Automatisoidut tehtävät</div>
                <div className="metric-value">247</div>
                <div className="metric-change">+23% tällä viikolla</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Säästetty aika</div>
                <div className="metric-value">18.5h</div>
                <div className="metric-change">Tänään</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Kustannussäästö</div>
                <div className="metric-value">€2,340</div>
                <div className="metric-change">Tässä kuussa</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
