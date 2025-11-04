"use client"

import { analytics } from '@/lib/analytics'

const pricingPlans = [
  {
    name: "Pilot",
    price: "0",
    period: "30 päivää",
    description: "Ilmainen kokeilu",
    features: [
      "OCR-kuittien käsittely",
      "ALV-laskelmat",
      "Perusraportit",
      "Sähköpostituki",
      "1 käyttäjä",
      "100 kuittia/kk"
    ],
    cta: "Aloita ilmaiseksi",
    popular: false,
    color: "gray"
  },
  {
    name: "Business",
    price: "99",
    period: "kuukausi",
    description: "Yrityksille",
    features: [
      "Kaikki Pilot-ominaisuudet",
      "Rajaton kuittien määrä",
      "Edistyneet raportit",
      "API-integraatiot",
      "5 käyttäjää",
      "Prioriteettituki",
      "Automaattiset varmuuskopiot"
    ],
    cta: "Aloita kokeilu",
    popular: true,
    color: "blue"
  },
  {
    name: "Enterprise",
    price: "299",
    period: "kuukausi",
    description: "Suuryrityksille",
    features: [
      "Kaikki Business-ominaisuudet",
      "Mukautetut integraatiot",
      "Dedicated support",
      "Rajaton käyttäjämäärä",
      "SLA 99.9%",
      "On-premise vaihtoehto",
      "Koulutus ja konsultointi"
    ],
    cta: "Pyydä tarjous",
    popular: false,
    color: "purple"
  }
]

export default function PremiumPricingComparison() {
  const handlePlanSelect = (plan: typeof pricingPlans[0]) => {
    analytics.trackPricingSelect(plan.name, parseInt(plan.price))
  }

  return (
    <section className="pricing-comparison">
      <div className="container">
        <div className="comparison-header">
          <h2 className="comparison-title">
            Vertaile suunnitelmia
          </h2>
          <p className="comparison-subtitle">
            Valitse sopiva suunnitelma yrityksellesi
          </p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.color}`}
            >
              {plan.popular && (
                <div className="popular-badge">
                  Suosituin
                </div>
              )}

              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="price-amount">{plan.price}€</span>
                  <span className="price-period">/{plan.period}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="plan-features">
                <ul className="features-list">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-cta">
                <button
                  className={`btn btn-${plan.color} btn-lg`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <p className="pricing-note">
            Kaikki suunnitelmat sisältävät 30 päivän ilmaisen kokeilun ja takuun.
            Voit peruuttaa milloin tahansa.
          </p>
          <div className="pricing-links">
            <a href="/terms" className="link">Käyttöehdot</a>
            <a href="/privacy" className="link">Tietosuojaseloste</a>
            <a href="/refund" className="link">Palautusehdot</a>
          </div>
        </div>
      </div>
    </section>
  )
}
