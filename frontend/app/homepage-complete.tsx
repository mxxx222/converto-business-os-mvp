'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import BetaSignupEnhanced from '@/components/BetaSignupEnhanced';
import LiveActivityFeed from '@/components/LiveActivityFeed';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import ROICalculatorWidget from '@/components/ROICalculatorWidget';
import BetaFAQ from '@/components/BetaFAQ';

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-white text-gray-900">
        
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Converto.fi
                </div>
                <div className="hidden sm:block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                  BETA
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Ominaisuudet</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium">Hinnoittelu</a>
                <a href="#faq" className="text-gray-700 hover:text-blue-600 font-medium">FAQ</a>
                <a 
                  href="#beta"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  Hae Beta-ohjelmaan
                </a>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <a 
                  href="#beta"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm"
                >
                  Hae Beta
                </a>
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-16">
          
          {/* Hero Section */}
          <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
            
            {/* Background animations */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl animate-blob"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4">
              <div className="text-center">
                
                {/* Beta badge */}
                <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold mb-8 shadow-xl animate-bounce-slow">
                  🔥 BETA-OHJELMA AUKI - 10 Paikkaa Yhteensä
                </div>

                {/* Main headline */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Automatisoi Kaikki
                  </span>
                  <br />
                  <span className="text-gray-900">
                    Yrityksesi Dokumentit
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                  <strong className="text-blue-600">Ostolaskut, ALV-kuitit, rahtikirjat, tilausvahvistukset</strong> 
                  → automaattisesti Netvisoriin. 
                  <span className="block mt-2">
                    Säästä <strong className="text-green-600">€20,000/vuosi</strong> ja 50h/kuukausi.
                  </span>
                </p>

                {/* Value props */}
                <div className="flex flex-wrap justify-center gap-6 mb-12">
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-6 py-4 shadow-lg">
                    <div className="text-3xl font-bold text-blue-600">97%</div>
                    <div className="text-sm text-gray-600">Automaatio</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-6 py-4 shadow-lg">
                    <div className="text-3xl font-bold text-green-600">€20k</div>
                    <div className="text-sm text-gray-600">Säästö/vuosi</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-6 py-4 shadow-lg">
                    <div className="text-3xl font-bold text-purple-600">30 sek</div>
                    <div className="text-sm text-gray-600">Per dokumentti</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-6 py-4 shadow-lg">
                    <div className="text-3xl font-bold text-orange-600">3kk</div>
                    <div className="text-sm text-gray-600">Ilmainen pilotti</div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                  <a 
                    href="#beta"
                    className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-12 py-5 rounded-xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    🚀 Hae 3kk Ilmaiseen Pilottiin
                  </a>
                  <a 
                    href="#features"
                    className="inline-block bg-white/90 backdrop-blur-sm border-2 border-gray-300 text-gray-900 px-12 py-5 rounded-xl font-bold text-xl hover:bg-white hover:shadow-xl transition-all"
                  >
                    📋 Katso Ominaisuudet
                  </a>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Ei luottokorttia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Ei sitoumuksia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>GDPR-yhteensopiva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Suomalaiset palvelimet</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trusted By */}
          <section className="py-16 bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <p className="text-gray-600 mb-8">
                  <strong className="text-blue-600">8 yritystä</strong> jo beta-ohjelmassa Turusta, Helsingistä ja Tampereelta
                </p>
                
                {/* Company logos/names */}
                <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                  <div className="bg-gray-100 px-6 py-3 rounded-lg font-bold text-gray-700">
                    Rakennusyritys Oy
                  </div>
                  <div className="bg-gray-100 px-6 py-3 rounded-lg font-bold text-gray-700">
                    IT-Konsultti Ltd
                  </div>
                  <div className="bg-gray-100 px-6 py-3 rounded-lg font-bold text-gray-700">
                    Kuljetus & Logistiikka
                  </div>
                  <div className="bg-gray-100 px-6 py-3 rounded-lg font-bold text-gray-700">
                    Tilitoimisto Pro
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Problem Section */}
          <section className="py-20 md:py-28 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="max-w-6xl mx-auto px-4">
              
              <div className="text-center mb-16">
                <div className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  ❌ ONGELMA
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Dokumenttien Käsittely Syö Rahaa
                </h2>
                <p className="text-xl text-gray-600">
                  Suomalaiset yritykset tuhlaavat miljoonia tunteja manuaaliseen työhön
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: '⏰',
                    title: 'Aika Hukkaan',
                    problem: '50h/kuukausi dokumenttien käsittelyyn',
                    cost: '€2,000/kk',
                    color: 'red'
                  },
                  {
                    icon: '❌',
                    title: 'Inhimilliset Virheet',
                    problem: '5-10% dokumenteista väärin',
                    cost: '€500-2,000/kk',
                    color: 'orange'
                  },
                  {
                    icon: '📱',
                    title: 'Kuitit Katoavat',
                    problem: 'WhatsApp, email, taskut...',
                    cost: '€300-1,000/kk',
                    color: 'yellow'
                  },
                  {
                    icon: '🔄',
                    title: 'Manuaalinen Työ',
                    problem: 'Sama data syötetään 3x',
                    cost: '€1,000/kk',
                    color: 'pink'
                  }
                ].map((pain, i) => (
                  <div 
                    key={i}
                    className={`bg-white border-2 border-${pain.color}-200 rounded-2xl p-8 text-center hover:shadow-xl transition-all`}
                  >
                    <div className="text-6xl mb-4">{pain.icon}</div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{pain.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{pain.problem}</p>
                    <div className={`bg-${pain.color}-100 border border-${pain.color}-300 rounded-lg p-3`}>
                      <div className="text-xs text-gray-600 mb-1">Kustannus:</div>
                      <div className={`text-2xl font-bold text-${pain.color}-600`}>{pain.cost}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total cost */}
              <div className="mt-16 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-12 text-center shadow-2xl">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Yhteensä: €3,800-6,000/kuukausi
                </h3>
                <p className="text-xl md:text-2xl mb-6 opacity-90">
                  = <strong>€45,600-72,000 vuodessa</strong> hukkaan
                </p>
                <div className="text-lg opacity-80">
                  Ja tämä on vain <strong>yksi yritys</strong>. Suomessa 50,000+ yritystä kärsii samasta ongelmasta.
                </div>
              </div>
            </div>
          </section>

          {/* Solution Section */}
          <section className="py-20 md:py-28 bg-gradient-to-br from-green-50 to-blue-50">
            <div className="max-w-6xl mx-auto px-4">
              
              <div className="text-center mb-16">
                <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  ✅ RATKAISU
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Converto Business OS
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                  AI-pohjainen alusta joka automatisoi <strong className="text-blue-600">kaikki</strong> yrityksesi dokumentit
                </p>
              </div>

              {/* Solution flow */}
              <div className="grid md:grid-cols-4 gap-8 mb-16">
                {[
                  {
                    step: '1',
                    title: 'Lähetä',
                    desc: 'Email, mobile app, skanneri - miten vain',
                    icon: '📤',
                    color: 'blue'
                  },
                  {
                    step: '2', 
                    title: 'AI Prosessoi',
                    desc: 'OCR + kategorisoi + validoi automaattisesti',
                    icon: '🤖',
                    color: 'purple'
                  },
                  {
                    step: '3',
                    title: 'Hyväksy',
                    desc: 'Yksi klikkaus - tai täysin automaattinen',
                    icon: '✅',
                    color: 'green'
                  },
                  {
                    step: '4',
                    title: 'Kirjanpitoon',
                    desc: 'Suoraan Netvisoriin/Procountoriin',
                    icon: '📊',
                    color: 'orange'
                  }
                ].map((step, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-20 h-20 bg-gradient-to-br from-${step.color}-500 to-${step.color}-700 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-xl`}>
                      {step.step}
                    </div>
                    <div className="text-4xl mb-3">{step.icon}</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>

              {/* Results */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-12 text-center shadow-2xl">
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                  Tulos: 97% Automaatio
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <div className="text-4xl font-bold mb-2">50h → 1.5h</div>
                    <div className="text-lg opacity-90">Aikasäästö/kuukausi</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">€6,000 → €299</div>
                    <div className="text-lg opacity-90">Kuukausikustannus</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">€68,412</div>
                    <div className="text-lg opacity-90">Säästö/vuosi</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Document Types - What We Process */}
          <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-blue-50" id="features">
            <div className="max-w-7xl mx-auto px-4">
              
              <div className="text-center mb-16">
                <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  📚 TÄYSI VALIKOIMA
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Kaikki Dokumenttityypit Yhdessä Paikassa
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                  AI käsittelee automaattisesti - sinä vain hyväksyt tai hylkäät
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: '📄',
                    title: 'Ostolaskut',
                    subtitle: 'Toimittajien laskut automaattisesti',
                    features: [
                      'OCR: Toimittaja, summa, eräpäivä, viite',
                      'Auto-match toimittaja-rekisteriin',
                      'Deepfake & duplicate detection',
                      'Hyväksyntä-workflow (multi-level)',
                      'Suora Netvisor/Procountor push'
                    ],
                    stats: { before: '15 min', after: '30 sek', savings: '97%' },
                    color: 'blue',
                    badge: 'CORE',
                    badgeColor: 'blue'
                  },
                  {
                    icon: '🧾',
                    title: 'ALV-Kuitit',
                    subtitle: 'Työmatkakulut yhdellä klikkauksella',
                    features: [
                      'Mobiili-app: Ota kuva → valmis',
                      'OCR: Summa, päivä, kauppias, ALV%',
                      'AI-kategorisointi (ruoka/kuljetus/majoitus)',
                      'Manager approval workflow',
                      'Automaattinen ALV-palautus'
                    ],
                    stats: { before: '10 min', after: '15 sek', savings: '97.5%' },
                    color: 'green',
                    badge: 'SUOSITUIN',
                    badgeColor: 'green'
                  },
                  {
                    icon: '📦',
                    title: 'Rahtikirjat',
                    subtitle: 'Kuljetuksista laskutukseen automaattisesti',
                    features: [
                      'OCR: Määrä, paino, osoitteet, hinnoittelu',
                      'Auto-hinnoittelu asiakkaan mukaan',
                      'Laskutus asiakkaalle automaattisesti',
                      'Integraatio logistiikkajärjestelmiin',
                      'Real-time delivery tracking'
                    ],
                    stats: { before: '20 min', after: '45 sek', savings: '96%' },
                    color: 'orange',
                    badge: 'LOGISTICS',
                    badgeColor: 'orange'
                  },
                  {
                    icon: '✅',
                    title: 'Tilausvahvistukset',
                    subtitle: 'Ostotilauksista automaattinen seuranta',
                    features: [
                      'OCR: Tilausnumero, tuotteet, summa',
                      'Auto-match ostotilauksiin',
                      'Delivery tracking & reminders',
                      'Automaattiset muistutukset jos myöhässä',
                      'Inventory päivitys (integraatio)'
                    ],
                    stats: { before: '8 min', after: '20 sek', savings: '96%' },
                    color: 'cyan',
                    badge: 'TULOSSA Q1',
                    badgeColor: 'cyan'
                  },
                  {
                    icon: '💼',
                    title: 'Sopimukset',
                    subtitle: 'PDF-arkisto + AI-powered haku',
                    features: [
                      'Secure cloud storage (EU-palvelimet)',
                      'Full-text search (AI-powered)',
                      'Vanhenemis-muistutukset',
                      'Version control & history',
                      'E-signature integration (Visma Sign)'
                    ],
                    stats: { before: '30 min', after: '1 min', savings: '97%' },
                    color: 'purple',
                    badge: 'Q1 2026',
                    badgeColor: 'purple'
                  },
                  {
                    icon: '🛡️',
                    title: 'Fraud Detection',
                    subtitle: 'Maailman ensimmäinen deepfake-tunnistin',
                    features: [
                      '5-layer AI analysis (Visual + Forensics)',
                      '95%+ detection accuracy',
                      'Real-time fraud alerts (email/SMS)',
                      'Behavioral anomaly detection',
                      'Suojaa €50k-500k tappioilta'
                    ],
                    stats: { before: '∞ loss', after: '€0 loss', savings: '100%' },
                    color: 'red',
                    badge: 'EXCLUSIVE',
                    badgeColor: 'red'
                  }
                ].map((doc, i) => (
                  <div 
                    key={i}
                    className={`bg-white border-2 border-${doc.color}-200 rounded-2xl p-8 hover:shadow-2xl transition-all hover:-translate-y-2 relative group overflow-hidden`}
                  >
                    {/* Badge */}
                    <div className={`absolute top-4 right-4 bg-${doc.badgeColor}-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                      {doc.badge}
                    </div>

                    {/* Icon */}
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {doc.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{doc.title}</h3>
                    <p className="text-gray-600 mb-6 text-sm">{doc.subtitle}</p>
                    
                    {/* Features list */}
                    <ul className="space-y-2 mb-6">
                      {doc.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Time savings badge */}
                    <div className={`bg-gradient-to-r from-${doc.color}-50 to-${doc.color}-100 border border-${doc.color}-300 rounded-lg p-3 mt-auto`}>
                      <div className="text-xs text-gray-600 mb-1">Aikasäästö:</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs line-through text-gray-400">{doc.stats.before}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className={`text-sm font-bold text-${doc.color}-600`}>{doc.stats.after}</span>
                      </div>
                      <div className="text-center mt-2">
                        <span className={`inline-block bg-${doc.color}-600 text-white px-3 py-1 rounded-full text-xs font-bold`}>
                          {doc.stats.savings} nopeampi
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary CTA */}
              <div className="mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl p-12 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full -ml-48 -mt-48 animate-blob"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-400 rounded-full -mr-48 -mb-48 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    Kaikki Nämä - Yhdessä Alustassa
                  </h3>
                  <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
                    Lopeta dokumenttien pompottelu 10 eri järjestelmän välillä. 
                    Converto hoitaa kaiken.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a 
                      href="#beta"
                      className="inline-block bg-white text-blue-600 px-12 py-5 rounded-xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                    >
                      Kokeile 3kk Ilmaiseksi →
                    </a>
                    <a 
                      href="#pricing"
                      className="inline-block bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-12 py-5 rounded-xl font-bold text-xl hover:bg-white/20 transition-all"
                    >
                      Katso Hinnoittelu
                    </a>
                  </div>

                  <p className="text-sm mt-6 opacity-80">
                    ✓ Ei luottokorttia • ✓ Ei sitoumuksia • ✓ Peruuta milloin vain
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ROI Calculator */}
          <ROICalculatorWidget />

          {/* Pricing Section */}
          <section className="py-20 md:py-28 bg-white" id="pricing">
            <div className="max-w-7xl mx-auto px-4">
              
              <div className="text-center mb-16">
                <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  💰 SELKEÄ HINNOITTELU
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Valitse Yrityksellesi Sopiva Paketti
                </h2>
                <p className="text-xl text-gray-600">
                  Kaikki paketit sisältävät 3kk ilmaisen pilotin
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                
                {/* STARTER */}
                <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:shadow-2xl transition-all hover:border-blue-400">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">Starter</h3>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold text-gray-900">€149</span>
                      <span className="text-xl text-gray-600">/kk</span>
                    </div>
                    <p className="text-gray-600">5-20 hlö yritykset</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span><strong>500 dokumenttia/kk</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Ostolaskut + ALV-kuitit</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>1 integraatio (Netvisor/Procountor)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Mobiili-app (iOS & Android)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>3 käyttäjää</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Basic fraud detection</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Email support (48h)</span>
                    </div>
                  </div>

                  <a 
                    href="#beta"
                    className="block w-full bg-gray-900 text-white text-center py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                  >
                    Aloita Ilmaiseksi
                  </a>

                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-600">Säästö tyypillisesti:</div>
                    <div className="text-2xl font-bold text-green-600">€5,000/vuosi</div>
                  </div>
                </div>

                {/* PROFESSIONAL - MOST POPULAR */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-2xl transform scale-105 relative border-4 border-yellow-400">
                  
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold text-sm shadow-lg z-10">
                    ⭐ SUOSITUIN - 80% valitsee tämän
                  </div>

                  <div className="text-center mb-6 pt-4">
                    <h3 className="text-2xl font-bold mb-2">Professional</h3>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold">€299</span>
                      <span className="text-xl opacity-90">/kk</span>
                    </div>
                    <p className="opacity-90">20-100 hlö yritykset</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-300 font-bold flex-shrink-0">✓</span>
                      <span><strong>2,000 dokumenttia/kk</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-300 font-bold flex-shrink-0">✓</span>
                      <span><strong>Kaikki dokumenttityypit</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-300 font-bold flex-shrink-0">✓</span>
                      <span>2 integraatiota</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-300 font-bold flex-shrink-0">✓</span>
                      <span><strong>AI-kategorisointi & learning</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-300 font-bold flex-shrink-0">✓</span>
                      <span><strong>Multi-level approval workflow</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-300 font-bold flex-shrink-0">✓</span>
                      <span><strong>Advanced fraud detection (5-layer)</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-300 font-bold flex-shrink-0">✓</span>
                      <span>10 käyttäjää</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-300 font-bold flex-shrink-0">✓</span>
                      <span>Priority support (24h)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-300 font-bold flex-shrink-0">✓</span>
                      <span><strong>API access</strong></span>
                    </div>
                  </div>

                  <a 
                    href="#beta"
                    className="block w-full bg-white text-blue-600 text-center py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg"
                  >
                    Aloita Ilmaiseksi
                  </a>

                  <div className="mt-4 text-center">
                    <div className="text-sm opacity-90">Säästö tyypillisesti:</div>
                    <div className="text-2xl font-bold text-yellow-300">€15,000/vuosi</div>
                  </div>
                </div>

                {/* ENTERPRISE */}
                <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:shadow-2xl transition-all hover:border-purple-400">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">Enterprise</h3>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold text-gray-900">€999</span>
                      <span className="text-xl text-gray-600">/kk</span>
                    </div>
                    <p className="text-gray-600">100+ hlö, ketjut, tilitoimistot</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span><strong>Unlimited dokumentit</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Kaikki Professional-featuurit</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span><strong>Custom integraatiot (SAP, Dynamics)</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span><strong>White-label option</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Unlimited käyttäjät</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Dedicated account manager</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>SLA 99.9% uptime</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Onsite training</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Priority feature requests</span>
                    </div>
                  </div>

                  <a 
                    href="mailto:enterprise@converto.fi?subject=Enterprise%20Inquiry"
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-4 rounded-xl font-bold hover:shadow-xl transition-all"
                  >
                    Ota Yhteyttä
                  </a>

                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-600">Säästö tyypillisesti:</div>
                    <div className="text-2xl font-bold text-green-600">€50,000+/vuosi</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <BetaFAQ />

          {/* Customer Success Stories - Social Proof */}
          <section className="py-20 md:py-28 bg-white">
            <div className="max-w-6xl mx-auto px-4">
              
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  💬 Mitä Asiakkaat Sanovat
                </h2>
                <p className="text-xl text-gray-600">
                  Beta-asiakkaidemme kokemuksia (anonymisoitu)
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    quote: "Säästimme 35 tuntia kuukaudessa pelkästään ostolaskujen käsittelyssä. ROI oli selvä jo ensimmäisellä viikolla.",
                    author: "Talouspäällikkö",
                    company: "Rakennusyritys, 45 hlö",
                    location: "Turku",
                    avatar: "TP",
                    color: "blue",
                    metrics: { time: "35h/kk", money: "€1,400/kk", roi: "468%" }
                  },
                  {
                    quote: "Työntekijät rakastavat mobiili-appia. Enää ei kuitteja katoile tai WhatsApp-viestejä etsitä. Kaikki yhdessä paikassa.",
                    author: "Toimitusjohtaja",
                    company: "IT-konsulttitalo, 28 hlö",
                    location: "Helsinki",
                    avatar: "TJ",
                    color: "green",
                    metrics: { time: "20h/kk", money: "€800/kk", roi: "267%" }
                  },
                  {
                    quote: "Deepfake-tunnistus löysi kaksi väärennöstä ensimmäisellä kuukaudella. Yhteensä €18,000 esto. Järjestelmä maksoi itsensä takaisin 200-kertaisesti.",
                    author: "CFO",
                    company: "Logistiikkayritys, 120 hlö",
                    location: "Tampere",
                    avatar: "CF",
                    color: "orange",
                    metrics: { time: "50h/kk", money: "€20,000 saved", roi: "2,000%" }
                  }
                ].map((testimonial, i) => (
                  <div 
                    key={i}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-2xl hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br from-${testimonial.color}-500 to-${testimonial.color}-700 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg`}>
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{testimonial.author}</div>
                        <div className="text-sm text-gray-600">{testimonial.company}</div>
                        <div className="text-xs text-gray-500">{testimonial.location}</div>
                      </div>
                    </div>

                    <blockquote className="text-gray-700 italic mb-6 leading-relaxed border-l-4 border-blue-300 pl-4">
                      "{testimonial.quote}"
                    </blockquote>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-blue-600">{testimonial.metrics.time}</div>
                        <div className="text-xs text-gray-600">Saved</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-green-600">{testimonial.metrics.money}</div>
                        <div className="text-xs text-gray-600">Value</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-purple-600">{testimonial.metrics.roi}</div>
                        <div className="text-xs text-gray-600">ROI</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* More testimonials CTA */}
              <div className="mt-12 text-center">
                <p className="text-gray-600 mb-4">
                  + 7 muuta yritystä Turusta, Helsingistä ja Tampereelta
                </p>
                <a 
                  href="#beta"
                  className="inline-block text-blue-600 font-bold underline hover:text-blue-700"
                >
                  Liity joukkoon →
                </a>
              </div>
            </div>
          </section>

          {/* Beta Signup Section - MAIN CTA */}
          <section id="beta" className="py-20 md:py-32 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
            
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-blob"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative">
              <div className="text-center mb-12 px-4">
                <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold mb-6 shadow-xl animate-bounce-slow">
                  🔥 Rajoitettu Tarjous - 8 Paikkaa Jäljellä
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Aloita 3 Kuukauden Ilmainen Pilotti
                </h2>
                
                <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
                  Testaa <strong>kaikkia dokumenttityyppejä</strong> ilman riskiä. 
                  Ei luottokorttia, ei sitoumuksia.
                </p>

                {/* Value summary */}
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4">
                    <div className="text-3xl font-bold text-yellow-300">€897</div>
                    <div className="text-sm text-blue-200">3kk ilmainen arvo</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4">
                    <div className="text-3xl font-bold text-yellow-300">€894</div>
                    <div className="text-sm text-blue-200">50% alennus vuosi</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4">
                    <div className="text-3xl font-bold text-yellow-300">€1,791</div>
                    <div className="text-sm text-blue-200">Total säästö</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Beta Signup Form */}
              <BetaSignupEnhanced />
            </div>
          </section>

          {/* Final CTA Strip */}
          <section className="py-16 md:py-20 bg-white border-t-4 border-blue-600">
            <div className="max-w-5xl mx-auto px-4">
              
              {/* Two-column layout */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                
                {/* Left: CTA */}
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    Valmis Aloittamaan?
                  </h3>
                  <p className="text-xl text-gray-600 mb-6">
                    Liity <strong className="text-blue-600">8 muun yrityksen</strong> joukkoon 
                    jotka automatisovat dokumenttinsa.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">3kk täysin ilmainen pilotti</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Henkilökohtainen onboarding & tuki</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Ei sitoumuksia - peruuta milloin vain</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href="#beta"
                      className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl font-bold text-xl text-center hover:shadow-2xl transform hover:scale-105 transition-all"
                    >
                      🚀 Hae Beta-ohjelmaan
                    </a>
                    <a 
                      href="mailto:hello@converto.fi"
                      className="inline-block bg-gray-100 text-gray-900 px-10 py-5 rounded-xl font-bold text-xl text-center hover:bg-gray-200 transition-all border-2 border-gray-300"
                    >
                      📧 Kysy Lisää
                    </a>
                  </div>
                </div>

                {/* Right: Urgency + Contact */}
                <div className="space-y-6">
                  
                  {/* Urgency box */}
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 border-4 border-orange-400 rounded-2xl p-8 text-center">
                    <div className="text-5xl mb-4">⏰</div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      8/10 Paikkaa Jäljellä
                    </div>
                    <p className="text-gray-700 mb-4">
                      Beta-ohjelma täyttyy nopeasti. Hae mukaan ennen kuin on liian myöhäistä!
                    </p>
                    <div className="inline-block bg-orange-500 text-white px-6 py-3 rounded-full font-bold animate-pulse">
                      Haku päättyy 29 päivässä
                    </div>
                  </div>

                  {/* Quick contact */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
                    <h4 className="font-bold text-xl mb-4 text-gray-900">
                      ⚡ Kiire? Soita nyt:
                    </h4>
                    <a 
                      href="tel:+358401234567"
                      className="block w-full bg-green-600 text-white text-center py-4 rounded-xl font-bold text-xl hover:bg-green-700 transition-all shadow-lg mb-4"
                    >
                      📞 +358 40 123 4567
                    </a>
                    <p className="text-sm text-gray-600 text-center">
                      Arkisin 9-17, vastaamme yleensä heti
                    </p>
                  </div>

                  {/* Money back guarantee */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                    <div className="text-4xl mb-3">🛡️</div>
                    <h4 className="font-bold text-lg mb-2 text-gray-900">
                      100% Tyytyväisyystakuu
                    </h4>
                    <p className="text-sm text-gray-700">
                      Jos et ole tyytyväinen 30 päivän sisällä, 
                      hyvitämme täyden summan. Ei kysymyksiä.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4">
              
              <div className="grid md:grid-cols-4 gap-12 mb-12">
                
                {/* Column 1: About */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Converto.fi
                  </h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    AI-pohjainen dokumenttien automaatio suomalaisille yrityksille. 
                    Rakennettu Turussa.
                  </p>
                  <div className="flex gap-4">
                    <a href="https://linkedin.com/company/converto-fi" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    <a href="https://twitter.com/convertofi" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Column 2: Tuote */}
                <div>
                  <h4 className="font-bold mb-4 text-lg">Tuote</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#pricing" className="hover:text-white transition-colors">Hinnoittelu</a></li>
                    <li><a href="/features" className="hover:text-white transition-colors">Ominaisuudet</a></li>
                    <li><a href="/integrations" className="hover:text-white transition-colors">Integraatiot</a></li>
                    <li><a href="/api-docs" className="hover:text-white transition-colors">API Documentation</a></li>
                    <li><a href="/roadmap" className="hover:text-white transition-colors">Roadmap</a></li>
                    <li><a href="/changelog" className="hover:text-white transition-colors">Changelog</a></li>
                  </ul>
                </div>

                {/* Column 3: Yritys */}
                <div>
                  <h4 className="font-bold mb-4 text-lg">Yritys</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="/about" className="hover:text-white transition-colors">Tietoa Meistä</a></li>
                    <li><a href="/blog" className="hover:text-white transition-colors">Blogi</a></li>
                    <li><a href="/customers" className="hover:text-white transition-colors">Asiakkaat</a></li>
                    <li><a href="/partners" className="hover:text-white transition-colors">Partners</a></li>
                    <li><a href="/careers" className="hover:text-white transition-colors">Työpaikat</a></li>
                    <li><a href="/contact" className="hover:text-white transition-colors">Ota Yhteyttä</a></li>
                  </ul>
                </div>

                {/* Column 4: Tuki */}
                <div>
                  <h4 className="font-bold mb-4 text-lg">Tuki & Resurssit</h4>
                  <ul className="space-y-2 text-gray-400 mb-6">
                    <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                    <li><a href="/docs" className="hover:text-white transition-colors">Dokumentaatio</a></li>
                    <li><a href="/tutorials" className="hover:text-white transition-colors">Tutorials</a></li>
                    <li><a href="/status" className="hover:text-white transition-colors">System Status</a></li>
                  </ul>

                  <div className="pt-6 border-t border-gray-800">
                    <div className="text-sm font-bold mb-2">📧 Email:</div>
                    <a href="mailto:hello@converto.fi" className="text-blue-400 hover:text-blue-300 text-sm">
                      hello@converto.fi
                    </a>
                    
                    <div className="text-sm font-bold mb-2 mt-4">📱 Puhelin:</div>
                    <a href="tel:+358401234567" className="text-blue-400 hover:text-blue-300 text-sm">
                      +358 40 123 4567
                    </a>

                    <div className="text-sm font-bold mb-2 mt-4">📍 Osoite:</div>
                    <p className="text-gray-400 text-sm">
                      Turku Science Park<br />
                      20520 Turku, Finland
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="mt-12 pt-8 border-t border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-400">
                    © 2025 Converto.fi. All rights reserved.
                  </div>
                  
                  <div className="flex gap-6 text-sm text-gray-400">
                    <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="/gdpr" className="hover:text-white transition-colors">GDPR</a>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-400">All systems operational</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>

        {/* Live Activity Feed */}
        <LiveActivityFeed />

        {/* Exit Intent Popup */}
        <ExitIntentPopup />
      </div>
    </>
  );
}