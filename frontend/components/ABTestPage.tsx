'use client'

import { useEffect, useState } from 'react'
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
  const abTesting = useABTesting()
  const [timeOnPage, setTimeOnPage] = useState(0)
  const [hasTrackedBounce, setHasTrackedBounce] = useState(false)

  // Get A/B testing functions only when on client
  const { variant, trackPageView, trackBounce } = isClient ? abTesting : {
    variant: 'A' as const,
    trackPageView: () => {},
    trackBounce: () => {}
  }

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true)
  }, [])

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

  // Track page view on mount
  useEffect(() => {
    trackPageView('/', window.document.referrer)
  }, [trackPageView])

  // Track time on page for bounce rate calculation
  useEffect(() => {
    const startTime = Date.now()
    let interval: NodeJS.Timeout

    const updateTime = () => {
      const currentTime = Date.now()
      const timeSpent = Math.floor((currentTime - startTime) / 1000)
      setTimeOnPage(timeSpent)

      // Track bounce if user leaves after 30 seconds without interaction
      if (timeSpent >= 30 && !hasTrackedBounce) {
        trackBounce('/', timeSpent * 1000)
        setHasTrackedBounce(true)
      }
    }

    interval = setInterval(updateTime, 1000)

    // Cleanup
    return () => {
      clearInterval(interval)
      if (!hasTrackedBounce) {
        trackBounce('/', timeOnPage * 1000)
      }
    }
  }, [trackBounce, hasTrackedBounce, timeOnPage])

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
