"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ChatBot from "@/components/ChatBot"

export default function AgentitPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              AI Agent Orchestrator™
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Älykkäät agentit jotka
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                {" "}työskentelevät puolestasi
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Anna tekoälyn hoitaa rutiinit. Agentit seuraavat lakimuutoksia, analysoivat dataa ja
              tekevät päätöksiä reaaliajassa. Aloita maksuttomalla kokeilulla.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setIsVideoOpen(true)}
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
              >
                Katso demo
              </button>
              <a
                href="#demo"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Aloita ilmainen kokeilu
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Jatkuva valvonta</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-gray-600">Luotettavuus</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-green-600 mb-2">10x</div>
                <div className="text-gray-600">Nopeampi reagointi</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Types Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Valmiit agentit yrityksellesi
              </h2>
              <p className="text-xl text-gray-600">
                Jokainen agentti on koulutettu toimimaan juuri sinun toimialallasi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Lakiasiantuntija Agentti</h3>
                <p className="text-gray-600 mb-6">
                  Seuraa lakimuutoksia, analysoi vaikutuksia ja ilmoittaa riskeistä ennen kuin ne vaikuttavat liiketoimintaan.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>ALV-lainsäädännön seuranta</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Työlainsäädännön muutokset</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Sopimusanalyysi</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Riskiarvioinnit</span>
                  </li>
                </ul>
                <div className="text-sm text-gray-500">
                  <strong>Säästää:</strong> 20 tuntia kuukaudessa lakiasioihin
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Myynti Agentti</h3>
                <p className="text-gray-600 mb-6">
                  Analysoi myyntidataa, tunnistaa trendit ja tekee ennusteita. Optimoi hinnoittelua ja kampanjoita automaattisesti.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Myyntitrendien analyysi</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Hinnoittelun optimointi</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Kampanjoiden A/B-testaus</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Liidien pisteytys</span>
                  </li>
                </ul>
                <div className="text-sm text-gray-500">
                  <strong>Kasvattaa myyntiä:</strong> 25% enemmän konversioita
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Talous Agentti</h3>
                <p className="text-gray-600 mb-6">
                  Analysoi talousdataa, seuraa budjetteja ja tekee ennusteita. Havaitsee poikkeamat ja ehdottaa korjaavia toimenpiteitä.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Kassavirtatarkkailu</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Budjetin seuranta</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Kustannusanalyysi</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Ennusteet ja trendit</span>
                  </li>
                </ul>
                <div className="text-sm text-gray-500">
                  <strong>Säästää:</strong> 15 tuntia kuukaudessa raportointiin
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Toimitusketju Agentti</h3>
                <p className="text-gray-600 mb-6">
                  Optimoi toimitusketjuja, seuraa toimituksia ja ennakoi häiriöitä. Varmistaa sujuvan logistiikan.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Toimitusten seuranta</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Varaston optimointi</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Toimittajasuhteet</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Riskienhallinta</span>
                  </li>
                </ul>
                <div className="text-sm text-gray-500">
                  <strong>Vähentää kustannuksia:</strong> 20% toimitusketjukuluissa
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Miten agentit toimivat?
              </h2>
              <p className="text-xl text-gray-600">
                Agentit oppivat jatkuvasti ja parantavat suorituskykyään
              </p>
            </div>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Koulutusvaihe</h3>
                  <p className="text-gray-600 mb-4">
                    Agentti koulutetaan yrityksesi tiedoilla, prosesseilla ja tavoitteilla.
                    Käytämme sekä yleistä tekoälyä että yrityskohtaista dataa.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                      <strong>Esimerkki:</strong> Lakiasiantuntija-agentti lukee kaikki Suomen
                      ALV-lainsäädännön muutokset ja analysoi niiden vaikutukset juuri sinun liiketoimintaasi.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-20 h-20 bg-purple-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Autonominen toiminta</h3>
                  <p className="text-gray-600 mb-4">
                    Agentti toimii itsenäisesti 24/7. Se seuraa dataa, tekee päätöksiä
                    ja ilmoittaa tärkeistä asioista oikeille henkilöille.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                      <strong>Esimerkki:</strong> Myynti-agentti havaitsee että tietty tuote
                      myy paremmin viikonloppuisin ja ehdottaa automaattista hinnanalennusta.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Jatkuva oppiminen</h3>
                  <p className="text-gray-600 mb-4">
                    Agentti oppii jokaisesta päätöksestä ja palautteesta. Suorituskyky
                    paranee jatkuvasti ilman manuaalista uudelleenkoulutusta.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                      <strong>Esimerkki:</strong> Talous-agentti oppii tunnistamaan
                      juuri sinun liiketoimintasi riskit ja antaa yhä tarkempia ennusteita.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Aloita ilmainen kokeilu
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Testaa yhtä agenttiamme maksutta 14 päivän ajan. Ei sitoumuksia, ei luottokorttia.
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Etunimi Sukunimi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sähköposti *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Yrityksen nimi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mikä agentti kiinnostaa?
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>Lakiasiantuntija Agentti</option>
                    <option>Myynti Agentti</option>
                    <option>Talous Agentti</option>
                    <option>Toimitusketju Agentti</option>
                    <option>Mukautettu agentti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mitä odotat agentilta?
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Kerro mitä ongelmia haluaisit ratkaista..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                >
                  Aloita ilmainen 14 päivän kokeilu
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Ei sitoumuksia • Peruutus milloin tahansa • Tuki sähköpostitse ja chatissa
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
              <h3 className="text-xl font-bold text-gray-900">AI Agent Orchestrator™ Demo</h3>
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
                <p className="text-sm text-gray-400 mt-2">Aloita ilmainen kokeilu päästäksesi agentteihimme</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
