"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ChatBot from "@/components/ChatBot"

export default function AutomaatioPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Automation Consulting™
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Automaatio joka
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}tuplaa tuottavuutesi
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Lopeta manuaaliset rutiinit. Automatisoi prosessit, jotka vievät aikaa mutta eivät vaadi luovuutta.
              Aloita 30 minuutin konsultaatio – saat konkreettisen suunnitelman ensimmäisistä automaatiosta.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setIsVideoOpen(true)}
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
              >
                Katso esittelyvideo
              </button>
              <a
                href="#contact"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Varaa konsultaatio
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Automatisoitua tuntia/kk</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                <div className="text-gray-600">Vähemmän virheitä</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-green-600 mb-2">3x</div>
                <div className="text-gray-600">Nopeampi kasvu</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Mitä automatisoimme?
              </h2>
              <p className="text-xl text-gray-600">
                Jokainen yritys on erilainen. Tunnistamme juuri sinun pullonkaulasi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Asiakaspalvelu</h3>
                <p className="text-gray-600 mb-4">
                  Automatisoi tukipyynnöt, tilausseuranta ja perusratkaisut. Vähennä vastausaikaa 90%.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Chatbotit ja FAQ</li>
                  <li>• Automaattiset vastaukset</li>
                  <li>• Tiket-järjestelmät</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Myyntiprosessi</h3>
                <p className="text-gray-600 mb-4">
                  Automatisoi liidien käsittely, seuraaminen ja konversio. Älä menetä yhtään potentiaalista asiakasta.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Liidien automaattinen pisteytys</li>
                  <li>• Seurantasähköpostit</li>
                  <li>• CRM-integraatiot</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Raportointi</h3>
                <p className="text-gray-600 mb-4">
                  Automatisoi raporttien luonti ja jakelu. Saa oikeat tiedot oikeaan aikaan ilman manuaalista työtä.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Päivittäiset dashboardit</li>
                  <li>• Myyntiraportit</li>
                  <li>• Talousraportit</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Varasto ja logistiikka</h3>
                <p className="text-gray-600 mb-4">
                  Automatisoi tilausten käsittely, varastonseuranta ja toimitukset. Vähennä toimitusvirheitä 95%.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Tilausten automaattinen käsittely</li>
                  <li>• Varaston optimointi</li>
                  <li>• Toimitusten seuranta</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl border border-red-200">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">HR ja rekrytointi</h3>
                <p className="text-gray-600 mb-4">
                  Automatisoi hakemusten käsittely, haastattelut ja onboardaus. Paranna rekrytointikokemusta.
                </p>
                <ul className="text-sm text-gray-6 00 space-y-2">
                  <li>• Hakemusten seulonta</li>
                  <li>• Haastatteluaikataulut</li>
                  <li>• Onboarding-prosessit</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl border border-indigo-200">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Mukautetut ratkaisut</h3>
                <p className="text-gray-600 mb-4">
                  Ei löytänyt mitä etsit? Rakennamme juuri sinun tarpeisiisi sopivan automaation.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Räätälöidyt integraatiot</li>
                  <li>• Legacy-järjestelmien modernisointi</li>
                  <li>• IoT ja älykkäät laitteet</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Miten työskentelemme?
              </h2>
              <p className="text-xl text-gray-600">
                Järjestelmällinen lähestymistapa takaa parhaat tulokset
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Kartoitus (30 min)</h3>
                  <p className="text-gray-600 mb-4">
                    Ilmainen konsultaatio jossa tunnistamme suurimmat automatisointimahdollisuudet.
                    Saat konkreettisen priorisointilistan ensimmäisistä askelista.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Prosessien analyysi</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">ROI-laskelmat</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Toteutussuunnitelma</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex-shrink-0 w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Pilottiprojekti (1-2 viikkoa)</h3>
                  <p className="text-gray-600 mb-4">
                    Toteutamme ensimmäisen automaation yhdessä. Näytämme konkreettisesti miten
                    prosessi toimii ja mitä hyötyjä siitä saadaan.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Nopea toteutus</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Koulutus</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Tuki</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Laajennus ja optimointi</h3>
                  <p className="text-gray-600 mb-4">
                    Skaalaamme onnistuneita automaatiota koko organisaatioon. Jatkuva optimointi
                    varmistaa parhaat mahdolliset tulokset.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Skaalaus</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Monitorointi</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Jatkuva parantaminen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Valmiina automatisoimaan?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Aloita 30 minuutin ilmaisella konsultaatioilla. Saat konkreettisen suunnitelman
              ensimmäisistä automaatiosta ja ROI-laskelmat.
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Etunimi Sukunimi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sähköposti *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Yrityksen nimi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mitä haluaisit automatisoida?
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Kerro lyhyesti prosesseista jotka vievät aikaa mutta eivät vaadi luovuutta..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Varaa ilmainen konsultaatio
                </button>
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
              <h3 className="text-xl font-bold text-gray-900">Automation Consulting™ Esittely</h3>
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
                <p className="text-lg">Video tulossa pian...</p>
                <p className="text-sm text-gray-400 mt-2">Ota yhteyttä saadaksesi henkilökohtaisen esittelyn</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
