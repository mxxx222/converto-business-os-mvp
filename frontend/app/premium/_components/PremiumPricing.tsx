"use client"

import { useState } from 'react'

export default function PremiumPricing(): JSX.Element {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: "Starter",
      price: { monthly: 97, yearly: 970 },
      description: "Täydellinen aloituspaketti pienyrityksille",
      features: [
        "5 automaatiota",
        "1 käyttäjätili",
        "Pankki-integraatio",
        "Laskutusautomaatio",
        "Sähköpostituki",
        "Mobiilisovellus",
        "Perusraportit"
      ],
      cta: "Aloita ilmaiseksi",
      popular: false
    },
    {
      name: "Professional",
      price: { monthly: 197, yearly: 1970 },
      description: "Suosituin vaihtoehto kasvaville yrityksille",
      features: [
        "25 automaatiota",
        "5 käyttäjätiliä",
        "Kaikki integraatiot",
        "AI-avusteinen automaatio",
        "Prioriteettituki",
        "Edistyneet raportit",
        "API-käyttöoikeudet",
        "Koulutusvideot"
      ],
      cta: "Aloita ilmaiseksi",
      popular: true
    },
    {
      name: "Enterprise",
      price: { monthly: 497, yearly: 4970 },
      description: "Kattava ratkaisu suuryrityksille",
      features: [
        "Rajoittamaton automaatio",
        "Rajoittamaton käyttäjät",
        "Mukautetut integraatiot",
        "Dedicated account manager",
        "24/7 puhelintuki",
        "Mukautetut raportit",
        "SLA-takuu",
        "Koulutus yritykselle"
      ],
      cta: "Ota yhteyttä",
      popular: false
    }
  ]

  const handlePlanSelect = async (planName: string) => {
    try {
      const response = await fetch('/api/pilot-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '',
          source: 'premium_pricing',
          plan: planName,
          billing: billingCycle
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
    <section className="premium-pricing" id="pricing">
      <div className="container">
        <div className="pricing-header">
          <h2 className="pricing-title">
            Valitse sopiva paketti yrityksellesi
          </h2>
          <p className="pricing-subtitle">
            Kaikki paketit sisältävät 14 päivän ilmaisen kokeilun
          </p>

          {/* Billing Toggle */}
          <div className="billing-toggle">
            <span className={billingCycle === 'monthly' ? 'active' : ''}>Kuukausi</span>
            <button
              className={`toggle-switch ${billingCycle === 'yearly' ? 'yearly' : ''}`}
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            >
              <span className="toggle-slider"></span>
            </button>
            <span className={billingCycle === 'yearly' ? 'active' : ''}>
              Vuosi
              <span className="discount-badge">-20% säästö</span>
            </span>
          </div>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && (
                <div className="popular-badge">Suosituin</div>
              )}

              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
                <div className="plan-price">
                  <span className="price-amount">
                    €{billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="price-period">
                    /{billingCycle === 'yearly' ? 'vuosi' : 'kuukausi'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="yearly-savings">
                    Säästät €{(plan.price.monthly * 12) - plan.price.yearly}/vuosi
                  </div>
                )}
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="feature-item">
                    <span className="feature-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-lg`}
                onClick={() => handlePlanSelect(plan.name)}
              >
                {plan.cta}
              </button>

              {plan.name === 'Starter' && (
                <p className="plan-note">
                  Aloita ilmaiseksi • Peruuta milloin tahansa
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="guarantee-section">
          <div className="guarantee-content">
            <div className="guarantee-icon">🛡️</div>
            <div className="guarantee-text">
              <h3>30 päivän rahat takaisin -takuu</h3>
              <p>
                Jos et ole tyytyväinen, palautamme rahasi kokonaan.
                Ei kysymyksiä, ei ongelmia.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="pricing-faq">
          <p>
            Epävarma mikä paketti sopii parhaiten?
            <a href="#faq" className="faq-link">Lue usein kysytyt kysymykset</a>
          </p>
        </div>
      </div>
    </section>
  )
}
