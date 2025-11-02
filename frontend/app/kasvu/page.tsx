"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ChatBot from "@/components/ChatBot"

export default function KasvuPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-cyan-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Growth Suite™
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Kasvu joka
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">
                {" "}skaalautuu automaattisesti
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Älä kamppaile markkinoinnin ja kasvun kanssa. Annan tekoälyn rakentaa
              asiakashankinnan koneen joka toimii 24/7 ja skaalautuu automaattisesti.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setIsVideoOpen(true)}
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
              >
                Katso kasvustrategia
              </button>
              <a
                href="#growth-plan"
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all shadow-lg"
              >
                Rakenna kasvusuunnitelma
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-emerald-600 mb-2">10x</div>
                <div className="text-gray-600">Nopeampi kasvu</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-cyan-600 mb-2">60%</div>
                <div className="text-gray-600">Pienemmät kustannukset</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Asiakashankinta</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Problems */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Mitä kasvun esteitä kohtaat?
              </h2>
              <p className="text-xl text-gray-600">
                Tunnistamme pullonkaulat ja rakennamme ratkaisun
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-4">Epäsäännöllinen asiakashankinta</h3>
                <p className="text-red-700 mb-4">
                  Kuukausien välillä isoja vaihteluita, ei ennustettavuutta, vaikea suunnitella kasvua.
                </p>
                <div className="text-red-600 text-sm">
                  <strong>Vaikutus:</strong> ~€15,000 hukattu potentiaalia kuukaudessa
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-4">Hidas reagointi markkinamuutoksiin</h3>
                <p className="text-red-700 mb-4">
                  Kilpailijat iskevät nopeasti, trendit muuttuvat, sinä reagoit liian hitaasti.
                </p>
                <div className="text-red-600 text-sm">
                  <strong>Vaikutus:</strong> ~€10,000 markkinaosuuden menetyksiä
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-4">Korkeat asiakashankinnan kustannukset</h3>
                <p className="text-red-700 mb-4">
                  Kallis markkinointi, huono ROI, asiakashankinta maksaa enemmän kuin saa tuloja.
                </p>
                <div className="text-red-600 text-sm">
                  <strong>Vaikutus:</strong> ~€8,000 hukattua markkinointibudjettia
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-4">Puutteellinen data ja analyysi</h3>
                <p className="text-red-700 mb-4">
                  Ei tiedetä mikä toimii, mikä ei, missä on potentiaalia. Päätökset mutu-tuntumalla.
                </p>
                <div className="text-red-600 text-sm">
                  <strong>Vaikutus:</strong> ~€5,000 hukattuja opportuniteetteja
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="bg-red-600 text-white p-6 rounded-2xl">
                <h3 className="text-2xl font-bold mb-2">💸 Kokonaiskustannus: €38,000/vuosi</h3>
                <p className="text-red-100">Mitä voisit tehdä €38,000:lla parempaa?</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Solution */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Growth Suite™ ratkaisee kaiken
              </h2>
              <p className="text-xl text-gray-600">
                Kokonaisvaltainen kasvukone joka toimii itsenäisesti
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Automaattinen asiakashankinta</h3>
                <p className="text-gray-600 mb-4">
                  24/7 asiakashankinta-kone joka hakee aktiivisesti uusia liidejä ja hoitaa koko prosessin automaattisesti.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Automaattiset outbound-kampanjat</li>
                  <li>• Sosiaalisen median markkinointi</li>
                  <li>• Hakukoneoptimointi</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Älykäs segmentointi</h3>
                <p className="text-gray-600 mb-4">
                  Segmentoi asiakkaat ja kohdista viestit täsmällisesti. Jokainen viesti on räätälöity vastaanottajalle.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Käyttäytymisperusteinen segmentointi</li>
                  <li>• Dynaaminen sisältö</li>
                  <li>• Personoidut kampanjat</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">ROI-optimointi</h3>
                <p className="text-gray-600 mb-4">
                  Analysoi jatkuvasti kunkin kanavan tehokkuutta ja siirrä resursseja parhaiten toimiviin.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Automaattinen A/B-testaus</li>
                  <li>• Kustannus-seuranta kanavittain</li>
                  <li>• ROI-laskelmat reaaliajassa</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nopea reagointi</h3>
                <p className="text-gray-600 mb-4">
                  Havaitsee markkinamuutokset ja trendit sekunneissa. Reagoi automaattisesti parantaen strategiaa.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Trendin seuranta</li>
                  <li>• Kilpailija-analyysi</li>
                  <li>• Opportuniteettien tunnistus</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl border border-indigo-200">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Lead-nurturing</h3>
                <p className="text-gray-600 mb-4">
                  Hoitaa liidejä automaattisesti myyntihistoriaan asti. Ei hukata potentiaalisia asiakkaita.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Automaattiset sähköpostisekvenssit</li>
                  <li>• CRM-integraatio</li>
                  <li>• Myyntiputken optimointi</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl border border-teal-200">
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kattavat raportit</h3>
                <p className="text-gray-600 mb-4">
                  Näe tarkasti mitä toimii, missä on potentiaalia ja mitä kannattaa kehittää.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Reaaliaikaiset dashboardit</li>
                  <li>• ROI-raportit</li>
                  <li>• Kasvuennusteet</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Asiakkaamme kasvavat nopeasti
              </h2>
              <p className="text-xl text-gray-600">
                Growth Suite™:n tulokset puhuvat puolestaan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">TechStart Oy</h3>
                    <p className="text-gray-600 text-sm">Saa-yritys, 15 henkilöä</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ennen Growth Suite™</span>
                    <span className="font-semibold text-red-600">8 liidiä/kk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">12 kuukauden jälkeen</span>
                    <span className="font-semibold text-green-600">87 liidiä/kk</span>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">+990% kasvu</div>
                    <div className="text-sm text-green-700">Liidimäärässä</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">K</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Kauppahuone Ltd</h3>
                    <p className="text-gray-600 text-sm">E-commerce, 45 henkilöä</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ennen Growth Suite™</span>
                    <span className="font-semibold text-red-600">€45k liikevaihto/kk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">18 kuukauden jälkeen</span>
                    <span className="font-semibold text-green-600">€156k liikevaihto/kk</span>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">+247% kasvu</div>
                    <div className="text-sm text-green-700">Liikevaihdossa</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">ConsultPro</h3>
                    <p className="text-gray-600 text-sm">Konsultointi, 8 henkilöä</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ennen Growth Suite™</span>
                    <span className="font-semibold text-red-600">23% konversio</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">6 kuukauden jälkeen</span>
                    <span className="font-semibold text-green-600">68% konversio</span>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">+196% parannus</div>
                    <div className="text-sm text-green-700">Konversiossa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Plan Section */}
      <section id="growth-plan" className="py-20 bg-gradient-to-r from-emerald-600 to-cyan-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Rakennetaan kasvustrategia
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Aloita ilmainen kasvuanalyysi. Saat konkreettisen suunnitelman
              30 päivän sisällä.
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Etunimi Sukunimi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sähköposti *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Yrityksen nimi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liikevaihto
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option>Alle €100k</option>
                    <option>€100k - €500k</option>
                    <option>€500k - €2M</option>
                    <option>€2M - €10M</option>
                    <option>Yli €10M</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kasvutavoite seuraavalle vuodelle
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option>2x nopeampi kasvu</option>
                    <option>3x nopeampi kasvu</option>
                    <option>5x nopeampi kasvu</option>
                    <option>10x nopeampi kasvu</option>
                    <option>Skaalaaminen kansainvälisesti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mitkä ovat suurimmat kasvun esteet?
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Kerro nykyisistä haasteista asiakashankinnassa, markkinoinnissa tai kasvussa..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all shadow-lg"
                >
                  Pyydä ilmainen kasvuanalyysi
                </button>

                <p className="text-xs text-gray-500 text-center">
                  48 tunnin sisällä saat kasvustrategian • 30 päivän takuu • Ei sitoumuksia
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
              <h3 className="text-xl font-bold text-gray-900">Growth Suite™ Kasvustrategia</h3>
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
                <p className="text-lg">Kasvustrategia-video tulossa pian...</p>
                <p className="text-sm text-gray-400 mt-2">Pyydä ilmainen kasvuanalyysi päästäksesi Growth Suite™:ään</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
