"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ChatBot from "@/components/ChatBot"

export default function VATServicePage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              VATService™
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              ALV-palvelu joka säästää
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                {" "}€10,000+ vuodessa
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Lopeta virheelliset ALV-laskelmat ja myöhästyneet ilmoitukset. Automatisoi ALV-laskenta,
              seuraa takaisinmaksuja ja vältä sakot automaattisesti.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setIsVideoOpen(true)}
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
              >
                Katso demo
              </button>
              <a
                href="#trial"
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
              >
                Aloita ilmainen kokeilu
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-orange-600 mb-2">€10,000+</div>
                <div className="text-gray-600">Säästöt/vuosi</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-red-600 mb-2">99.8%</div>
                <div className="text-gray-600">Tarkkuus</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                <div className="text-gray-600">Myöhästyneet ilmoitukset</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Mitä väärin menee ALV-käsittelyssä?
              </h2>
              <p className="text-xl text-gray-600">
                Yleinen yritysten pelko: ALV-sakot, virheelliset laskelmat ja hukatut rahat
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-4">💸 Virheelliset ALV-laskelmat</h3>
                <p className="text-red-700 mb-4">
                  Väärät ALV-käsittelyt, tarkistamattomat poikkeamat ja hukatut takaisinmaksut.
                </p>
                <ul className="text-red-600 space-y-2">
                  <li>• ~€5,000 takaisinmaksua hukkaan vuodessa</li>
                  <li>• ~€2,000 virhelaskelmien korjauksiin</li>
                  <li>• ~€1,000 viivästysseuraamukset</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-4">⏰ Myöhästyneet ilmoitukset</h3>
                <p className="text-red-700 mb-4">
                  Unohdettu ilmoitus, käsittelyaikailla hukattu tilaisuus korjata virhe.
                </p>
                <ul className="text-red-600 space-y-2">
                  <li>• ~€2,000 viivästysseuraamukset</li>
                  <li>• ~€1,000 korjausmaksut</li>
                  <li>• ~€3,000 mainehaitta</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-4">🤯 Liian monimutkainen</h3>
                <p className="text-red-700 mb-4">
                  ALV-säännökset muuttuvat jatkuvasti, erikoistilaukset ja EU-vaikutukset.
                </p>
                <ul className="text-red-600 space-y-2">
                  <li>• ~€2,000 juridinen konsultointi</li>
                  <li>• ~€1,000 koulutus</li>
                  <li>• ~€4,000 hukattu aika</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-4">📉 Kilpailuetu hukkaan</h3>
                <p className="text-red-700 mb-4">
                  Kilpailijasi käyttää automaatiota, säästää kustannuksia ja reagoi nopeammin.
                </p>
                <ul className="text-red-600 space-y-2">
                  <li>• ~€5,000 kilpailuetu</li>
                  <li>• ~€3,000 markkinaosuus</li>
                  <li>• ~€2,000 tulosmarginaali</li>
                </ul>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="bg-red-600 text-white p-6 rounded-2xl">
                <h3 className="text-2xl font-bold mb-2">💸 Kokonaiskustannus: €35,000/vuosi</h3>
                <p className="text-red-100">Mitä voisit tehdä €35,000:lla parempaa?</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                VATService™ ratkaisee kaiken
              </h2>
              <p className="text-xl text-gray-600">
                Älykkäämpi ALV-käsittely = vähemmän virheitä, enemmän säästöjä
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Automaattinen ALV-laskenta</h3>
                <p className="text-gray-600 mb-4">
                  100% tarkka ALV-laskenta kaikille tapahtumille. Ei manuaalisia virheitä.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Eri ALV-käsittelyjen automaatio</li>
                  <li>• Kansainvälisen kaupan laskenta</li>
                  <li>• Erityisalustukset ja erikoisratkaisut</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h10a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Automaattiset ilmoitukset</h3>
                <p className="text-gray-600 mb-4">
                  Verohallinnolle tehdään ilmoitukset automaattisesti oikea-aikaisesti.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Kuukausi-ilmoitukset</li>
                  <li>• Vuosittaiset ilmoitukset</li>
                  <li>• Muutokset ja korjaukset</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Takaisinmaksun seuranta</h3>
                <p className="text-gray-600 mb-4">
                  Seuraa ALV-takaisinmaksuja ja ennakoi kassavirtaa.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Takaisinmaksuehdotukset</li>
                  <li>• Kassa-analyysi</li>
                  <li>• Kansainvälisen kaupan takaisinmaksut</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Älykäs optimointi</h3>
                <p className="text-gray-600 mb-4">
                  Optimoi ALV-käsittelyt automaattisesti parhaiden kustannusrakenteiden mukaan.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• ALV-käsittelyvaihtoehdot</li>
                  <li>• Kustannusanalyysi</li>
                  <li>• Taloussuunnittelun optimointi</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl border border-indigo-200">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Raportointi ja analyysit</h3>
                <p className="text-gray-600 mb-4">
                  Selkeät raportit ALV-asioista. KPI-seuranta ja suorituskykyindikaattorit.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Reaaliaikaiset dashboardit</li>
                  <li>• Vuosittaiset analyysit</li>
                  <li>• Kustannustrendien seuranta</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl border border-teal-200">
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Lakisäädösten seuranta</h3>
                <p className="text-gray-600 mb-4">
                  Seuraamme ALV-lainsäädäntöä automaattisesti ja päivitämme järjestelmän.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Uusien sääntöjen automaattinen päivitys</li>
                  <li>• Vaikutusanalyysit</li>
                  <li>• Riskien arviointi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Kuinka paljon voisit säästää?
              </h2>
              <p className="text-xl text-gray-600">
                Laskuri näyttää VATService™:n todellisen ROI:n
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Nykyiset kustannukset</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ALV-hakemusten käsittely</span>
                      <span className="font-semibold">€2,400/vuosi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Virhelaskelmien korjaukset</span>
                      <span className="font-semibold">€3,600/vuosi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Myöhästyneet ilmoitukset</span>
                      <span className="font-semibold">€1,800/vuosi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Juridinen konsultointi</span>
                      <span className="font-semibold">€1,200/vuosi</span>
                    </div>
                    <div className="flex justify-between border-t pt-4">
                      <span className="text-gray-900 font-bold">Nykyiset kustannukset yhteensä</span>
                      <span className="font-bold text-red-600">€9,000/vuosi</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">VATService™:n kanssa</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">VATService™ palvelu</span>
                      <span className="font-semibold">-€4,800/vuosi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Virhelaskelmien säästö</span>
                      <span className="font-semibold text-green-600">+€3,600/vuosi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Takaisinmaksut optimointi</span>
                      <span className="font-semibold text-green-600">+€2,400/vuosi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Juridisen konsultoinnin säästö</span>
                      <span className="font-semibold text-green-600">+€1,200/vuosi</span>
                    </div>
                    <div className="flex justify-between border-t pt-4 bg-green-50 p-4 rounded-lg">
                      <span className="text-gray-900 font-bold">Netto-säästö</span>
                      <span className="font-bold text-green-600">€2,400/vuosi</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-4 bg-green-50 px-8 py-4 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600">ROI: 150%</div>
                  <div className="text-gray-600">€1 invested = €2.50 return</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Miten VATService™ toimii?
              </h2>
              <p className="text-xl text-gray-600">
                Helppo integraatio nykyisiin järjestelmiisi
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-50 p-8 rounded-2xl">
                <div className="flex-shrink-0 w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Integraatio nykyisiin järjestelmiin</h3>
                  <p className="text-gray-600 mb-4">
                    Yhdistämme VATService™:n kirjanpito-ohjelmaasi, CRM:iin ja maksujärjestelmääsi.
                    Ei uusia ohjelmia, ei muutoksia työtapoihin.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                      <strong>Tuetut järjestelmät:</strong> Procountor, Netvisor, Kirjanpito.com, Xero, QuickBooks, ja yli 50 muuta
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-50 p-8 rounded-2xl">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Automaattinen ALV-laskenta</h3>
                  <p className="text-gray-600 mb-4">
                    Jokainen tapahtuma lasketaan automaattisesti oikealla ALV-prosentilla.
                    EU-hankinnat, vienti, vientitulot ja erikoisratkaisut huomioitu.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                      <strong>Esimerkki:</strong> Kun kirjaat myynnin, VATService™ laskee automaattisesti
                      ALV-käsittelyn, luo tarvittavat kirjaukset ja merkitsee tapahtuman valmiiksi veroilmoitukseen.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-50 p-8 rounded-2xl">
                <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Automaattiset ilmoitukset ja raportit</h3>
                  <p className="text-gray-600 mb-4">
                    Kuukausi-ilmoitukset ja vuosittaiset ilmoitukset lähetetään automaattisesti
                    Verohallinnolle oikea-aikaisesti. Saapuneista ilmoituksista tulee raportti sähköpostiisi.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                      <strong>Aikataulu:</strong> Kuukausi-ilmoitukset 12. päivä, Vuosilaskelmat 31.3., Arvioilaukset 1.6. ja 1.12.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="trial" className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Aloita ilmainen 30 päivän kokeilu
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Testaa VATService™ maksutta 30 päivän ajan. Saat selkeät raportit nykyisistä kustannuksista
              ja säästöpotentiaalista. Ei luottokorttia, ei sitoumuksia.
            </p>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nimi *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Etunimi Sukunimi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sähköposti *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="email@yritys.fi"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yrityksen nimi
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Yrityksen nimi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Käyttämäsi kirjanpito-ohjelma
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option>Procountor</option>
                    <option>Netvisor</option>
                    <option>Kirjanpito.com</option>
                    <option>Xero</option>
                    <option>QuickBooks</option>
                    <option>Muu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kuukausittainen ALV-määrä
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option>Alle €10,000</option>
                    <option>€10,000 - €50,000</option>
                    <option>€50,000 - €100,000</option>
                    <option>€100,000 - €500,000</option>
                    <option>Yli €500,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mitä haluaisit automatisoida?
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Kerro nykyisestä ALV-käsittelystäsi ja ongelmista..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
                >
                  Aloita ilmainen 30 päivän kokeilu
                </button>

                <p className="text-xs text-gray-500 text-center">
                  30 päivää maksutonta • Ei luottokorttia • Perinteinen asiakaspalvelu • GDPR-yhteensopiva
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatBot />

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">VATService™ Demo</h3>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Demo tulossa pian...</p>
                <p className="text-sm text-gray-400 mt-2">Aloita ilmainen kokeilu päästäksesi VATService™:ään</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
