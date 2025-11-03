'use client'

import Link from "next/link"
import { useEffect } from "react"
import { useConversionTracking } from "@/lib/conversion-tracking"
import { useABTesting } from "@/lib/ab-testing"

interface HeroBProps {
  title: string
  subtitle: string
  ctaPrimary: { label: string; href: string }
  ctaSecondary?: { label: string; href: string }
  image?: string
}

export default function HeroB({ title, subtitle, ctaPrimary, ctaSecondary, image }: HeroBProps) {
  const { trackView } = useConversionTracking()
  const { trackEvent, trackClick } = useABTesting()

  useEffect(() => {
    trackView('landing', { page: 'hero_b' })
    trackEvent('hero_view', { version: 'optimized' })
  }, [trackView, trackEvent])

  const handleCTAClick = (ctaType: string, href: string) => {
    trackClick(ctaType, href)
    trackEvent('cta_click', { cta_type: ctaType, version: 'optimized' })
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20 relative bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container-lg max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE - Content (60%) */}
          <div className="text-left space-y-8">

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              🚀 Ensimmäiset 50 yritystä - Ilmainen 30pv pilotti
            </div>

            {/* Main Headline - Optimized for Problem/Solution */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              <span className="text-red-600">Säästä 10 tuntia viikossa</span>
              <br />
              <span className="text-blue-600">Automaattinen kirjanpito</span>
              <br />
              <span className="text-gray-700">ilman virheitä</span>
            </h1>

            {/* Problem Statement */}
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
              <p className="text-lg text-gray-800 font-medium">
                Olet juuri nyt tuhlaamassa <span className="font-bold text-red-600">10 tuntia viikossa</span> manuaaliseen kirjanpitoon.
              </p>
              <p className="text-red-700 mt-2">
                Converto automatisoi sen ja estää <span className="font-bold">5000€ verovirheet</span>.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Nolla verovirheitä</span>
                  <span className="text-gray-600 ml-2">(5000€ sakkojen riski poissa)</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">3 kuukauden ROI</span>
                  <span className="text-gray-600 ml-2">(maksaa itsensä takaisin)</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">50+ suomalaista yritystä</span>
                  <span className="text-gray-600 ml-2">jo käytössä</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons - Single Primary Focus */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">

              {/* PRIMARY CTA - Full width on mobile, large on desktop */}
              <Link
                href={ctaPrimary.href}
                className="inline-flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex-1 sm:flex-initial"
                onClick={() => handleCTAClick('primary', ctaPrimary.href)}
              >
                <span className="mr-3">🚀</span>
                {ctaPrimary.label}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              {/* SECONDARY CTA - Smaller, less prominent */}
              {ctaSecondary && (
                <Link
                  href={ctaSecondary.href}
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold rounded-lg transition-all duration-200 flex-1 sm:flex-initial"
                  onClick={() => handleCTAClick('secondary', ctaSecondary.href)}
                >
                  → Katso 3 min demo
                </Link>
              )}
            </div>

            {/* Social Proof - Simplified */}
            <div className="flex items-center gap-8 pt-8 border-t border-gray-200">
              <div className="text-sm text-gray-600">Luotettu kumppani:</div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="font-medium">Suomen Yrittäjät</span>
                <span>•</span>
                <span className="font-medium">TechFinland</span>
                <span>•</span>
                <span className="font-medium">Y-Combinator</span>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE - Visual (40%) */}
          <div className="relative">

            {/* Hero Image/Video Placeholder */}
            {image && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-3xl opacity-20 scale-105"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  {/* Placeholder for animation/video */}
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <div className="text-gray-600 font-medium">Prosessianimaatio</div>
                      <div className="text-sm text-gray-500">Kuitti → OCR → ALV → Vero.fi</div>
                    </div>
                  </div>

                  {/* Process Steps Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white rounded-full p-4 shadow-lg">
                      <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Stats Cards */}
            <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-green-600">10h</div>
              <div className="text-sm text-gray-600">Säästöä/viikko</div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">5000€</div>
              <div className="text-sm text-gray-600">Vältetty sakko</div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-100 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>

        {/* Key Metrics Bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">40%</div>
            <div className="text-sm text-gray-600">Ajan säästö</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">7pv</div>
            <div className="text-sm text-gray-600">Käyttöönotto</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">24/7</div>
            <div className="text-sm text-gray-600">Tuki</div>
          </div>
        </div>
      </div>
    </section>
  )
}
