'use client'

import { useEffect, useState, useRef } from 'react'
import { useABTesting } from '@/lib/ab-testing'

// Import both versions
import Hero from "@/components/Hero"
import HeroB from "@/components/HeroB"
import ProductServiceGrid from "@/components/ProductServiceGrid"
import BenefitsB from "@/components/BenefitsB"
import SocialProof from "@/components/SocialProof"
import ProblemDepth from "@/components/ProblemDepth"
import Solution from "@/components/Solution"
import Plan from "@/components/Plan"
import ROICalculator from "@/components/ROICalculator"
import PricingPreview from "@/components/PricingPreview"
import CTA from "@/components/CTA"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ABTestDashboardToggle } from "@/components/ABTestDashboard"

export default function ABTestPage() {
  // Only initialize A/B testing on client side
  const [isClient, setIsClient] = useState(false)
  const [variant, setVariant] = useState<'A' | 'B'>('A')
  const [timeOnPage, setTimeOnPage] = useState(0)
  const [hasTrackedBounce, setHasTrackedBounce] = useState(false)

  const abTesting = useABTesting()

  // Store everything in refs to prevent render-triggered updates
  const trackPageViewRef = useRef(abTesting.trackPageView)
  const trackBounceRef = useRef(abTesting.trackBounce)

  // Initialize client flag on mount
  useEffect(() => {
    setIsClient(true)
    // Only run once on mount
  }, [])

  // Don't update variant here - useABTesting hook handles it in useEffect
  // Just read the variant from the hook when client is ready

  // Keep function refs in sync - but only assign once, not on every render
  // These should be stable from the hook, so just update refs once on mount
  useEffect(() => {
    trackPageViewRef.current = abTesting.trackPageView
    trackBounceRef.current = abTesting.trackBounce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - functions should be stable from hook

  // Track page view on mount - only once
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') {
      return
    }

    trackPageViewRef.current('/', window.document.referrer)
    // Only run once when client initializes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient])

  // Track time on page for bounce rate calculation
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') {
      return
    }

    const startTime = Date.now()
    let interval: NodeJS.Timeout | null = null
    let currentTimeSpent = 0
    let hasTrackedBounceLocal = false

    const updateTime = () => {
      const currentTime = Date.now()
      currentTimeSpent = Math.floor((currentTime - startTime) / 1000)
      setTimeOnPage(currentTimeSpent)

      // Track bounce if user leaves after 30 seconds without interaction
      if (currentTimeSpent >= 30 && !hasTrackedBounceLocal) {
        trackBounceRef.current('/', currentTimeSpent * 1000)
        hasTrackedBounceLocal = true
        setHasTrackedBounce(true)
      }
    }

    interval = setInterval(updateTime, 1000)

    // Cleanup
    return () => {
      if (interval) {
        clearInterval(interval)
      }
      // Use closure value instead of state
      if (currentTimeSpent > 0 && !hasTrackedBounceLocal) {
        trackBounceRef.current('/', currentTimeSpent * 1000)
      }
    }
    // Only run once when client initializes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient])

  // Keep variant in sync once client is ready
  useEffect(() => {
    if (!isClient) {
      return
    }

    const resolveVariant = () => {
      if (typeof abTesting?.getVariant === 'function') {
        return abTesting.getVariant()
      }
      if (typeof (abTesting as any)?.variant === 'string') {
        return (abTesting as any).variant as 'A' | 'B'
      }
      return 'A'
    }

    const currentVariant = resolveVariant()
    setVariant(currentVariant)
  }, [abTesting, isClient])

  // Don't render A/B content during SSR
  if (!isClient) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </>
    )
  }

  // Helper to render appropriate component based on variant
  const renderComponent = (ComponentA: any, ComponentB: any, props: any) => {
    if (variant === 'B' && ComponentB) {
      return <ComponentB {...props} />
    }
    return <ComponentA {...props} />
  }

  const heroProps = {
    title: "Manuaalinen kirjanpito tuhlaa 10h/viikko",
    subtitle: "Converto Solutions – Automate your entire business stack. Automatisoi 90% kirjanpitoprosesseista.",
    ctaPrimary: { label: "Kokeile Business OS:ta ilmaiseksi", href: "/business-os/pilot" },
    ctaSecondary: { label: "Katso palvelupaketit", href: "/services" },
    image: "/images/converto-hero.png"
  }

  return (
    <>
      {/* A/B Test Variant Indicator (Development/Debug only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 z-50 bg-black text-white px-4 py-2 text-sm font-bold">
          A/B Test Variant: {variant}
        </div>
      )}

      {/* A/B Test Dashboard Toggle (Production) */}
      {process.env.NODE_ENV === 'production' && <ABTestDashboardToggle />}

      <Navbar />

      {/* Hero Section - A/B Test */}
      {renderComponent(Hero, HeroB, heroProps)}

      {/* Product Service Grid - Same for both (Unified brand) */}
      <ProductServiceGrid />

      {/* Social Proof - Same for both */}
      <SocialProof
        companyCount={50}
        testimonials={[]}
      />

      {/* Benefits Section - A/B Test */}
      {variant === 'B' ? <BenefitsB /> : (
        <ProblemDepth
          title="Manuaaliset prosessit maksavat enemmän kuin arvaat."
          items={[
            {
              category: "Kustannukset",
              title: "40% tuottavuudesta hukkaan",
              description: "Yritys menettää 40% tuottavuudesta manuaalisiin prosesseihin, jotka voisi automatisoida.",
              icon: "💰"
            },
            {
              category: "Riski",
              title: "Verovirheet maksavat tuhansia",
              description: "Virheet veroilmoituksissa maksavat 5000€+ ja voivat aiheuttaa veroviraston tarkastuksia.",
              icon: "⚠️"
            },
            {
              category: "Aika",
              title: "Kirjanpito vie päiviä",
              description: "Kirjanpito vie 2-3 päivää kuukaudessa, joka olisi paremmin käytetty kasvutoimintaan.",
              icon: "⏱️"
            }
          ]}
        />
      )}

      {/* Solution - Same for both */}
      <Solution
        title="Ratkaisu: Automatisoi koko stack"
        items={[
          {
            feature: "OCR + ALV",
            benefit: "Kuittien skannaus → Automaattinen ALV-erittely → Vero.fi -integroitu",
            savings: "Säästä 8h/viikko",
            icon: "🧾"
          },
          {
            feature: "VAT Calculator",
            benefit: "Tarkka ALV-laskenta → Ei verovirheitä → Ajan tasalla automaattisesti",
            savings: "Säästä 5000€/vuosi",
            icon: "🧮"
          },
          {
            feature: "ChatService™",
            benefit: "AI vastaa kysymyksiin → Ei yötöitä → GPT-5 -pohjainen",
            savings: "Säästä 2000€/kk",
            icon: "🤖"
          }
        ]}
      />

      {/* Process - Same for both */}
      <Plan
        title="Näin aloitat"
        steps={[
          { number: "1", text: "Valitse ratkaisu (Business OS tai Services)" },
          { number: "2", text: "Saat pääsyn demo-ympäristöön heti" },
          { number: "3", text: "Aloita ilmainen pilotti tai projekti" }
        ]}
      />

      {/* ROI Calculator - Enhanced for B */}
      <ROICalculator />

      {/* Pricing Preview - Same for both */}
      <PricingPreview />

      {/* Final CTA - A/B Test */}
      <CTA
        title={variant === 'B'
          ? "Säästä 10h/viikko - Aloita ilmainen pilotti"
          : "Aloita ilmaiseksi 30pv tai pyydä tarjous palveluista"
        }
        subtitle="30 päivää ilmaiseksi - Ei korttitietoja - Peruuta milloin tahansa"
        ctaLabel={variant === 'B' ? "🚀 Aloita nyt" : "Aloita nyt →"}
        href="/business-os/pilot"
      />

      <Footer />
    </>
  )
}
