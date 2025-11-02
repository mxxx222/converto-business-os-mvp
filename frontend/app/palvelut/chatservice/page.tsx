"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ChatBot from "@/components/ChatBot"

export default function ChatServicePage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              ChatService™
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              GPT-5 tekoäly joka
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                {" "}myy ja palvelee 24/7
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Anna tekoälyn hoitaa asiakaspalvelu ja myynti. Koulutettu chatbottimme ymmärtää
              asiakkaasi, vastaa kysymyksiin ja tekee kaupat kun sinä nukut.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setIsVideoOpen(true)}
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
              >
                Katso demo
              </button>
              <a
                href="#setup"
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Aloita maksuton kokeilu
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                <div className="text-gray-600">Kysymyksistä vastattu</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Saatavilla</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">3x</div>
                <div className="text-gray-600">Myynti yöllä</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Älykkäämpi kuin perinteiset chatbotit
              </h2>
              <p className="text-xl text-gray-600">
                Ei vain FAQ-vastauksia – oikea asiakaspalvelu ja myynti
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kontekstuaalinen ymmärrys</h3>
                <p className="text-gray-600 mb-4">
                  Muistaa aiempia keskusteluja ja ymmärtää asiakkaan tilanteen kokonaisvaltaisesti.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Muisti edellisistä keskusteluista</li>
                  <li>• Ymmärtää asiakkaan tarpeet</li>
                  <li>• Personoitu palvelu</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Myyntioptimointi</h3>
                <p className="text-gray-600 mb-4">
                  Tunnistaa myyntimahdollisuudet ja ohjaa asiakasta kohti kauppaa luonnollisesti.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Tuotteen suositukset</li>
                  <li>• Hinnastojen esittely</li>
                  <li>• Tarjousten tekeminen</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Integraatiot</h3>
                <p className="text-gray-600 mb-4">
                  Yhdistyy CRM:iin, maksujärjestelmiin ja muihin työkaluihin saumattomasti.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• CRM-integraatio</li>
                  <li>• Maksujärjestelmät</li>
                  <li>• Kalenterivaraukset</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nopea reagointi</h3>
                <p className="text-gray-600 mb-4">
                  Vastaa välittömästi kaikkiin kysymyksiin, myös yöllä ja viikonloppuisin.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Alle sekunnin vasteaika</li>
                  <li>• 24/7 saatavilla</li>
                  <li>• Ei jonoja</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl border border-red-200">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Analytiikka</h3>
                <p className="text-gray-600 mb-4">
                  Seuraa keskusteluja, mittaa onnistumisia ja optimoi jatkuvasti suorituskykyä.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Keskusteluanalyysi</li>
                  <li>• Konversioseuranta</li>
                  <li>• Parannusehdotukset</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl border border-indigo-200">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Jatkuva oppiminen</h3>
                <p className="text-gray-600 mb-4">
                  Oppii jokaisesta keskustelusta ja parantaa vastauksiaan ajan myötä.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• GPT-5 koulutuksen päivitys</li>
                  <li>• Asiakaspalautteen hyödyntäminen</li>
                  <li>• Automaattinen optimointi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Näe ChatService™ toiminnassa
              </h2>
              <p className="text-xl text-gray-600">
                Esimerkkikeskustelu oikean asiakkaan kanssa
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4">
                <h3 className="text-white font-bold text-lg">ChatService™ Demo</h3>
                <p className="text-green-100 text-sm">Keskustelu verkkokaupan asiakkaan kanssa</p>
              </div>

              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <p className="text-gray-900">Hei! Etsin uutta läppäriä työhön. Budjetti on noin 1500€.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-green-500 text-white rounded-lg p-3 max-w-[80%]">
                    <p>Terve! Hienoa että olet kiinnostunut. Kerro hieman enemmän käyttötarkoituksesta - onko tämä ohjelmistokehitykselle, suunnittelulle vai yleiskäyttöön?</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <p>Ohjelmistokehitykselle. Tarvitset myös hyvää akkua koska matkustan paljon.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-green-500 text-white rounded-lg p-3 max-w-[80%]">
                    <p>Loistavaa! Suosittelen Lenovo ThinkPad X1 Carbon Gen 11 - 16" näyttö, 32GB RAM, i7 prosessori. Akku kestää 12+ tuntia. Hinta 1599€ (sis. ALV).

Saisinko sähköpostiosoitteesi niin lähetän tarkemmat speksit ja ilmaisen toimituksen?</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <p>Kiitos! Speksit kuulostavat hyvältä. email@asiakas.fi</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-green-500 text-white rounded-lg p-3 max-w-[80%]">
                    <p>Täydellistä! Lähetin juuri sähköpostin jossa on:
• Tuotteen tarkat speksit
• Ilmainen toimitus huomenna
• 30 päivän palautusoikeus
• Asennusapu etänä

Voit myös maksaa heti saadaksesi 5% alennuksen. Haluaisitko edetä tilaukseen?</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 border-t">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Tulos:</strong> Asiakas sai henkilökohtaista palvelua 24/7, tuotesuositus perustui tarpeisiin,
                  kauppa syntyi automaattisesti ilman ihmisen väliintuloa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section id="setup" className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Aloita maksuton kokeilu
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Testaa ChatService™ maksutta 14 päivän ajan. Ei luottokorttia, ei sitoumuksia.
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Etunimi Sukunimi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sähköposti *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Yrityksen nimi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verkkosivuston URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://yrityksesi.fi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mitä chatbottisi pitäisi osata?
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Kerro tuotteistasi, palveluistasi ja yleisimmistä asiakaskysymyksistä..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
                >
                  Aloita maksuton 14 päivän kokeilu
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Asennamme chatbotin verkkosivustollesi • Koulutamme sen yrityksesi tiedoilla • 24/7 tuki kokeilun aikana
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
              <h3 className="text-xl font-bold text-gray-900">ChatService™ Demo</h3>
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
                <p className="text-sm text-gray-400 mt-2">Aloita maksuton kokeilu päästäksesi ChatService™:ään</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
