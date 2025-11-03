'use client'

import { useEffect } from "react"
import { useABTesting } from "@/lib/ab-testing"

interface BenefitItem {
  icon: string
  title: string
  description: string
  features: string[]
  color: 'green' | 'blue' | 'orange'
}

export default function BenefitsB() {
  const { trackEvent } = useABTesting()

  useEffect(() => {
    trackEvent('benefits_view', { version: 'optimized' })
  }, [trackEvent])

  const benefits: BenefitItem[] = [
    {
      icon: "⏱️",
      title: "10h/viikko säästöä",
      description: "Automaattinen kirjanpito ilman käsin tekemistä",
      features: [
        "Kuittien skannaus",
        "Automaattinen ALV-erittely"
      ],
      color: "green"
    },
    {
      icon: "🎯",
      title: "Nolla verovirheitä",
      description: "ALV-laskelmat tarkistaa AI, ei enää 5000€ sakkojen riski",
      features: [
        "ALV-laskenta automaattinen",
        "Vero.fi integroitu",
        "Ei yötyötä"
      ],
      color: "blue"
    },
    {
      icon: "💰",
      title: "3kk ROI",
      description: "Palvelee itsensä takaisin 3 kuukaudessa",
      features: [
        "Räätälöity automaatio",
        "Koodauspalvelut",
        "AI-agentit"
      ],
      color: "orange"
    }
  ]

  const getColorClasses = (color: 'green' | 'blue' | 'orange') => {
    switch (color) {
      case 'green':
        return {
          border: "border-green-200",
          bg: "bg-green-50",
          icon: "bg-green-100",
          iconText: "text-green-600",
          title: "text-green-600"
        }
      case 'blue':
        return {
          border: "border-blue-200",
          bg: "bg-blue-50",
          icon: "bg-blue-100",
          iconText: "text-blue-600",
          title: "text-blue-600"
        }
      case 'orange':
        return {
          border: "border-orange-200",
          bg: "bg-orange-50",
          icon: "bg-orange-100",
          iconText: "text-orange-600",
          title: "text-orange-600"
        }
    }
  }

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Miksi valita Converto?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kolme konkreettista hyötyä jotka säästävät aikaa, rahaa ja hermoja
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const colors = getColorClasses(benefit.color)

            return (
              <div
                key={index}
                className={`
                  relative bg-white rounded-2xl shadow-lg border-2 ${colors.border}
                  hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2
                  p-8 group cursor-pointer
                `}
                onClick={() => trackEvent('benefit_click', { benefit: benefit.title, version: 'optimized' })}
              >
                {/* Icon */}
                <div className={`${colors.icon} ${colors.iconText} w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon}
                </div>

                {/* Title */}
                <h3 className={`text-2xl font-bold ${colors.title} mb-4`}>
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  {benefit.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3">
                  {benefit.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover Effect Gradient */}
                <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

                {/* Card Number Badge */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Valmis säästämään 10 tuntia viikossa?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Aloita ilmainen 30 päivän pilotti ja näe tulokset ensimmäisen viikon aikana.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => trackEvent('benefits_cta_click', { version: 'optimized' })}
            >
              <span className="mr-3">🚀</span>
              Aloita ilmainen pilotti
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
