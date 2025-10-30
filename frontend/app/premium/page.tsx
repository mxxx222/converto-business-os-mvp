"use client"

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'
import PremiumNavbar from './_components/PremiumNavbar'
import WowNavbar from './_components/WowNavbar'
import PremiumHero from './_components/PremiumHero'
import WowHero from './_components/WowHero'
import PremiumLogos from './_components/PremiumLogos'
import PremiumProblem from './_components/PremiumProblem'
import PremiumSolution from './_components/PremiumSolution'
import WowSolution from './_components/WowSolution'
import PremiumFeatures from './_components/PremiumFeatures'
import PremiumTestimonials from './_components/PremiumTestimonials'
import PremiumPricing from './_components/PremiumPricing'
import PremiumPricingComparison from './_components/PremiumPricingComparison'
import PremiumVerifiedProof from './_components/PremiumVerifiedProof'
import PremiumGuarantee from './_components/PremiumGuarantee'
import PremiumFAQ from './_components/PremiumFAQ'
import PremiumCTA from './_components/PremiumCTA'
import WowPlan from './_components/WowPlan'
import WowCTA from './_components/WowCTA'

export default function PremiumPage(): JSX.Element {
  useEffect(() => {
    // Track premium page view
    analytics.trackPremiumView()

    const onUnload = () => {
      analytics.track('page_exit', { page: '/premium' })
    }
    window.addEventListener('pagehide', onUnload)
    return () => window.removeEventListener('pagehide', onUnload)
  }, [])

  return (
    <div className="premium-landing">
      {/* New wow navbar + existing navbar for continuity */}
      <WowNavbar />
      <PremiumNavbar />
      {/* New wow hero followed by existing hero */}
      <WowHero />
      <PremiumHero />
      <PremiumLogos />
      <PremiumProblem />
      <PremiumSolution />
      <WowSolution />
      <PremiumFeatures />
      <PremiumTestimonials />
      <PremiumPricing />
      <PremiumPricingComparison />
      <PremiumVerifiedProof />
      <PremiumGuarantee />
      <PremiumFAQ />
      <WowPlan />
      <WowCTA />
      <PremiumCTA />
      
      {/* Sticky CTA */}
      <div className="sticky-cta">
        <a 
          href="#pilot" 
          className="btn btn-primary btn-lg"
          onClick={() => analytics.trackCTAClick('sticky', 'bottom')}
        >
          Aloita ilmaiseksi
        </a>
      </div>
    </div>
  )
}
