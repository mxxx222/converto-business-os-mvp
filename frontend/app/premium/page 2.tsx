"use client"

import { useEffect } from 'react'
import PremiumNavbar from './_components/PremiumNavbar'
import PremiumHero from './_components/PremiumHero'
import PremiumLogos from './_components/PremiumLogos'
import PremiumProblem from './_components/PremiumProblem'
import PremiumSolution from './_components/PremiumSolution'
import PremiumFeatures from './_components/PremiumFeatures'
import PremiumTestimonials from './_components/PremiumTestimonials'
import PremiumPricing from './_components/PremiumPricing'
import PremiumGuarantee from './_components/PremiumGuarantee'
import PremiumFAQ from './_components/PremiumFAQ'
import PremiumCTA from './_components/PremiumCTA'

export default function PremiumPage(): JSX.Element {
  useEffect(() => {
    // Analytics tracking
    fetch('/api/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'page_view', where: 'premium_landing' })
    }).catch(() => {})

    const onUnload = () => {
      const data = JSON.stringify({ name: 'page_close', where: 'premium_landing' })
      navigator.sendBeacon?.('/api/event', new Blob([data], { type: 'application/json' }))
    }
    window.addEventListener('pagehide', onUnload)
    return () => window.removeEventListener('pagehide', onUnload)
  }, [])

  return (
    <div className="premium-landing">
      <PremiumNavbar />
      <PremiumHero />
      <PremiumLogos />
      <PremiumProblem />
      <PremiumSolution />
      <PremiumFeatures />
      <PremiumTestimonials />
      <PremiumPricing />
      <PremiumGuarantee />
      <PremiumFAQ />
      <PremiumCTA />

      {/* Sticky CTA */}
      <div className="sticky-cta">
        <a href="#pilot" className="btn btn-primary btn-lg">
          Aloita ilmaiseksi
        </a>
      </div>
    </div>
  )
}
