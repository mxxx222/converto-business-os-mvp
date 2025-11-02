'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, Star, Users, TrendingUp, Shield, Zap } from 'lucide-react'

interface FormData {
  name: string
  email: string
  company: string
  role: string
  employees: string
  challenge: string
  timeline: string
  domain: string
}

interface ConversionData {
  headline: string
  subheadline: string
  cta: string
  benefits: string[]
  social_proof: string[]
  urgency: string
}

export default function DynamicLeadForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    employees: '',
    challenge: '',
    timeline: '',
    domain: ''
  })

  const [conversionData, setConversionData] = useState<ConversionData>({
    headline: "Vapauta yrityksesi potentiaali älykkäällä automaatiolla",
    subheadline: "Liity 500+ suomalaisyrityksen joukkoon, jotka ovat kasvattaneet tuottavuuttaan 300%",
    cta: "Aloita ilmainen kokeilu",
    benefits: [
      "99.8% tarkkuudella toimiva OCR",
      "AI-myyntiassistentti 24/7",
      "Automatisoitu kirjanpito",
      "EU-GDPR compliant"
    ],
    social_proof: [
      "⭐⭐⭐⭐⭐ 'Muutti koko liiketoimintamme' - CEO, TechFlow Oy",
      "🏆 'Paras SaaS-investointi koskaan' - CFO, InnoTech",
      "📈 '300% tuottavuuden kasvu 3 kuukaudessa' - COO, DataCorp"
    ],
    urgency: "Vain 50 paikkaa jäljellä tämän kuukauden ilmaiseen premium-kokeiluun"
  })

  // Dynamic domain detection and personalization
  useEffect(() => {
    const detectDomain = () => {
      const hostname = window.location.hostname
      const referrer = document.referrer

      // Domain-specific messaging
      if (hostname.includes('converto.fi')) {
        setConversionData(prev => ({
          ...prev,
          headline: "Suomalainen yritysautomaatio seuraavalle tasolle",
          subheadline: "Liity 200+ suomalaisyrityksen joukkoon, jotka luottavat Convertoon",
          benefits: [
            "Suomi-pohjainen asiakastuki",
            "ALV-optimointi EU-markkinoille",
            "24/7 suomenkielinen tuki",
            "GDPR & EU compliance"
          ]
        }))
      } else if (referrer.includes('linkedin')) {
        setConversionData(prev => ({
          ...prev,
          headline: "Liiketoimintajohtajat valitsevat Converton",
          subheadline: "LinkedInin suosituin B2B-automaatiotyökalu Suomessa",
          urgency: "Liity 50+ johtajan joukkoon jotka ovat jo mukana"
        }))
      } else if (referrer.includes('google')) {
        setConversionData(prev => ({
          ...prev,
          headline: "Hae 'paras yritysautomaatio' - löydät Converton",
          subheadline: "Google-haun #1 tulos yritysautomaatiolle Suomessa"
        }))
      }
    }

    detectDomain()
  }, [])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Dynamic form adaptation based on inputs
    if (field === 'role' && value === 'CEO') {
      setConversionData(prev => ({
        ...prev,
        headline: "CEO: Vapauta aika strategiaan, automatisoi operatiivinen työ",
        benefits: [
          "Strateginen dashboard johtamiseen",
          "AI-pohjaiset päätöksentukijärjestelmät",
          "Automatisoitu raportointi",
          "Riskienhallinta ja compliance"
        ]
      }))
    } else if (field === 'role' && value === 'CFO') {
      setConversionData(prev => ({
        ...prev,
        headline: "CFO: Optimoi kustannukset, maksimoi ROI",
        benefits: [
          "Automatisoitu kustannusseuranta",
          "AI-pohjainen budjetointi",
          "Real-time talousraportit",
          "Kustannussäästöt 40%"
        ]
      }))
    }
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/pilot/optimized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'dynamic_lead_form',
          conversion_data: conversionData,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer
        })
      })

      if (response.ok) {
        setStep(5) // Success step
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid lg:grid-cols-2 gap-12 items-start">

        {/* Left Column - Dynamic Messaging */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >

          {/* Dynamic Headline */}
          <div className="space-y-4">
            <motion.h1
              key={conversionData.headline}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
            >
              {conversionData.headline}
            </motion.h1>

            <motion.p
              key={conversionData.subheadline}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600"
            >
              {conversionData.subheadline}
            </motion.p>
          </div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {conversionData.benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">Mitä asiakkaamme sanovat</h3>
            <div className="space-y-3">
              {conversionData.social_proof.map((proof, index) => (
                <motion.div
                  key={proof}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <p className="text-gray-700 italic">"{proof}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Urgency Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white"
          >
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-lg">Rajoitettu tarjous!</h4>
                <p className="text-orange-100">{conversionData.urgency}</p>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* Right Column - Dynamic Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8"
        >

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <motion.div
                  animate={{
                    backgroundColor: step >= stepNum ? '#3B82F6' : '#E5E7EB',
                    scale: step === stepNum ? 1.1 : 1
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                >
                  {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </motion.div>
                {stepNum < 4 && (
                  <div className={`w-12 h-1 mx-2 rounded ${step > stepNum ? 'bg-blue-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Step 1: Basic Info */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-gray-900">Kerro itsestäsi</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nimesi"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Sähköpostiosoitteesi"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Company Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-gray-900">Yrityksesi tiedot</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Yrityksen nimi"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Valitse roolisi</option>
                      <option value="CEO">CEO / Toimitusjohtaja</option>
                      <option value="CFO">CFO / Talousjohtaja</option>
                      <option value="COO">COO / Operatiivinen johtaja</option>
                      <option value="CTO">CTO / Teknologiajohtaja</option>
                      <option value="CMO">CMO / Markkinointijohtaja</option>
                      <option value="Other">Muu</option>
                    </select>
                    <select
                      value={formData.employees}
                      onChange={(e) => handleInputChange('employees', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Yrityksen koko</option>
                      <option value="1-10">1-10 työntekijää</option>
                      <option value="11-50">11-50 työntekijää</option>
                      <option value="51-200">51-200 työntekijää</option>
                      <option value="201-1000">201-1000 työntekijää</option>
                      <option value="1000+">1000+ työntekijää</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Challenge & Timeline */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-gray-900">Mitä haasteita ratkaisemme?</h3>
                  <div className="space-y-4">
                    <select
                      value={formData.challenge}
                      onChange={(e) => handleInputChange('challenge', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Suurin haasteesi tällä hetkellä</option>
                      <option value="efficiency">Tuottavuuden parantaminen</option>
                      <option value="costs">Kustannusten optimointi</option>
                      <option value="growth">Liiketoiminnan kasvattaminen</option>
                      <option value="compliance">Compliance ja säädökset</option>
                      <option value="automation">Manuaalisten prosessien automatisointi</option>
                      <option value="reporting">Raportointi ja analytiikka</option>
                    </select>
                    <select
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Milloin haluat aloittaa?</option>
                      <option value="asap">Heti kun mahdollista</option>
                      <option value="1month">1 kuukauden sisällä</option>
                      <option value="3months">3 kuukauden sisällä</option>
                      <option value="6months">6 kuukauden sisällä</option>
                      <option value="exploring">Vielä tutkimusvaiheessa</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Domain & Final CTA */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-gray-900">Varmistus</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Verkkosivustosi (jos on)"
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    {/* Summary */}
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <h4 className="font-semibold text-gray-900">Yhteenveto:</h4>
                      <p className="text-sm text-gray-600">
                        <strong>{formData.name}</strong> yrityksestä <strong>{formData.company}</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Haaste: <strong>{formData.challenge}</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Aikataulu: <strong>{formData.timeline}</strong>
                      </p>
                    </div>

                    {/* Final CTA */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>{conversionData.cta}</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Success Step */}
              {step === 5 && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  </motion.div>

                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-gray-900">Kiitos ilmoittautumisesta!</h3>
                    <p className="text-lg text-gray-600">
                      Saat sähköpostiisi yksityiskohtaiset ohjeet seuraavissa vaiheissa.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        🎉 Olet nyt prioriteettilistallamme! Otamme yhteyttä 24 tunnin sisällä.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {step < 4 && step !== 5 && (
              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edellinen
                  </button>
                )}
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>Seuraava</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </form>

        </motion.div>

      </div>
    </div>
  )
}