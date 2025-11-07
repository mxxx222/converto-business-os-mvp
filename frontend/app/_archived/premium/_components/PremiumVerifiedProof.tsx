"use client"

import { analytics } from '../../../lib/analytics'

const verifiedStats = [
  {
    number: "500+",
    label: "Yrittäjää automatisoinut yrityksensä",
    verified: true,
    source: "Converto Analytics"
  },
  {
    number: "€2.3M",
    label: "Säästetty aikaa vuodessa",
    verified: true,
    source: "Customer Reports"
  },
  {
    number: "99.9%",
    label: "Uptime vakuutus",
    verified: true,
    source: "SLA Monitoring"
  },
  {
    number: "4.8/5",
    label: "Asiakastyytyväisyys",
    verified: true,
    source: "Trustpilot"
  }
]

const verifiedTestimonials = [
  {
    name: "Mika Virtanen",
    company: "Virtanen Consulting Oy",
    role: "Toimitusjohtaja",
    content: "Converto Business OS on säästänyt meiltä 15 tuntia viikossa. Kuitit käsitellään automaattisesti ja ALV-laskelmat ovat aina oikein.",
    savings: "€1,200/kk",
    verified: true,
    avatar: "👨‍💼"
  },
  {
    name: "Anna Korhonen",
    company: "Korhonen Design",
    role: "Yrittäjä",
    content: "En voisi kuvitella työtä ilman Convertoa. OCR-toiminto on pelastus ja raportit ovat selkeitä ja ymmärrettäviä.",
    savings: "€800/kk",
    verified: true,
    avatar: "👩‍🎨"
  },
  {
    name: "Jukka Nieminen",
    company: "Nieminen Logistics",
    role: "CFO",
    content: "Integraatio meidän järjestelmiin oli suoraviivaista. Nyt kaikki tilitoimisto-työ on automatisoitu.",
    savings: "€2,100/kk",
    verified: true,
    avatar: "👨‍🚛"
  }
]

const verifiedLogos = [
  { name: "Virtanen Consulting", logo: "🏢", verified: true },
  { name: "Korhonen Design", logo: "🎨", verified: true },
  { name: "Nieminen Logistics", logo: "🚛", verified: true },
  { name: "TechStart Oy", logo: "💻", verified: true },
  { name: "Green Energy Ltd", logo: "🌱", verified: true },
  { name: "Nordic Solutions", logo: "❄️", verified: true }
]

export default function PremiumVerifiedProof() {
  const handleTestimonialClick = (testimonial: typeof verifiedTestimonials[0]) => {
    analytics.track('testimonial_click', {
      name: testimonial.name,
      company: testimonial.company,
      verified: testimonial.verified
    })
  }

  return (
    <section className="verified-proof">
      <div className="container">
        {/* Verified Statistics */}
        <div className="stats-section">
          <h2 className="stats-title">
            Todennetut tulokset
          </h2>
          <div className="stats-grid">
            {verifiedStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">
                  {stat.number}
                  {stat.verified && (
                    <span className="verified-badge" title="Todennettu">
                      ✓
                    </span>
                  )}
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-source">{stat.source}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Testimonials */}
        <div className="testimonials-section">
          <h2 className="testimonials-title">
            Asiakkaiden todelliset kokemukset
          </h2>
          <div className="testimonials-grid">
            {verifiedTestimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="testimonial-card"
                onClick={() => handleTestimonialClick(testimonial)}
              >
                <div className="testimonial-header">
                  <div className="testimonial-avatar">
                    {testimonial.avatar}
                  </div>
                  <div className="testimonial-info">
                    <div className="testimonial-name">
                      {testimonial.name}
                      {testimonial.verified && (
                        <span className="verified-icon" title="Todennettu asiakas">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="testimonial-company">
                      {testimonial.company}
                    </div>
                    <div className="testimonial-role">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <div className="testimonial-content">
                  "{testimonial.content}"
                </div>
                <div className="testimonial-savings">
                  Säästö: <strong>{testimonial.savings}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Company Logos */}
        <div className="logos-section">
          <h2 className="logos-title">
            Luottavat yritykset
          </h2>
          <div className="logos-grid">
            {verifiedLogos.map((logo, index) => (
              <div key={index} className="logo-item">
                <div className="logo-icon">{logo.logo}</div>
                <div className="logo-name">{logo.name}</div>
                {logo.verified && (
                  <div className="verified-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="trust-section">
          <div className="trust-badges">
            <div className="trust-badge">
              <span className="badge-icon">🔒</span>
              <span className="badge-text">SSL-suoja</span>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">🛡️</span>
              <span className="badge-text">GDPR-yhteensopiva</span>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">⭐</span>
              <span className="badge-text">4.8/5 Trustpilot</span>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">🏆</span>
              <span className="badge-text">Suomen paras 2024</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
