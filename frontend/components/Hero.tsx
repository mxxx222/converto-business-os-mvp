'use client'

import Link from "next/link"
import { useEffect } from "react"
import { useConversionTracking } from "@/lib/conversion-tracking"

interface HeroProps {
  title: string
  subtitle: string
  ctaPrimary: { label: string; href: string }
  image?: string
}

export default function Hero({ title, subtitle, ctaPrimary, image }: HeroProps) {
  const { trackView } = useConversionTracking()

  useEffect(() => {
    trackView('landing', { page: 'hero' })
  }, [trackView])

  return (
    <section className="hero-section min-h-screen flex items-center justify-center px-6 py-20 relative">
      <div className="container-lg text-center space-y-8 relative z-10">
        {/* Trust Badge */}
        <div className="badge badge-primary mb-6">
          🚀 Ensimmäiset 50 yritystä - Ilmainen 30pv pilotti
        </div>

        {/* Main Headline */}
        <h1 className="text-display-xl gradient-text max-w-4xl mx-auto">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <Link
            href={ctaPrimary.href}
            className="btn-cta hover-lift"
          >
            {ctaPrimary.label}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="https://app.converto.fi/demo"
            className="btn-secondary hover-lift"
          >
            Katso demo
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="mt-12 flex items-center justify-center gap-8 opacity-70">
          <div className="text-sm text-gray-500">Luotettu kumppani:</div>
          <div className="flex items-center gap-6">
            <div className="logo">Suomen Yrittäjät</div>
            <div className="logo">TechFinland</div>
            <div className="logo">Y-Combinator</div>
          </div>
        </div>

        {/* Hero Image/Video */}
        {image && (
          <div className="mt-16 relative">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl blur-3xl opacity-20 scale-105"></div>
              <img
                src={image}
                alt="Converto Business OS Dashboard"
                className="relative w-full h-auto rounded-2xl shadow-2xl border border-gray-200"
              />
              {/* Play button overlay for demo video */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all hover:scale-110">
                  <svg className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Key Stats */}
        <div className="stats-grid mt-16">
          <div className="stat-card">
            <div className="stat-number">40%</div>
            <div className="stat-label">Ajan säästö</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">7pv</div>
            <div className="stat-label">Käyttöönotto</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Tuki</div>
          </div>
        </div>
      </div>

      {/* Floating elements (Revolut-style) */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary-100 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-success-100 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
    </section>
  )
}
