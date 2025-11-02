"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ChatBot from "@/components/ChatBot"

export default function YhteysPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    urgency: 'normal'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Ota yhteyttä
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}meihin
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Autamme yrityksiä automatisoimaan prosesseja ja kasvattamaan liiketoimintaa.
              Kerro haasteesi ja löydämme yhdessä parhaan ratkaisun.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Vastaamme 24 tunnin sisällä</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+358 40 123 4567</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Miten haluat meihin yhteyttä?
              </h2>
              <p className="text-xl text-gray-600">
                Valitse sinulle sopivin tapa olla yhteydessä
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all cursor-pointer">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sähköposti</h3>
                <p className="text-gray-600 mb-4">Yleisin yhteydenottotapa. Saat vastauksen 24 tunnin sisällä.</p>
                <a href="mailto:hello@converto.fi" className="text-blue-600 font-semibold hover:text-blue-700">
                  hello@converto.fi
                </a>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-200 hover:shadow-lg transition-all cursor-pointer">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Puhelu</h3>
                <p className="text-gray-600 mb-4">Soita suoraan. Vastaamme arkisin klo 9-17.</p>
                <a href="tel:+358401234567" className="text-green-600 font-semibold hover:text-green-700">
                  +358 40 123 4567
                </a>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all cursor-pointer">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Chat</h3>
                <p className="text-gray-600 mb-4">Näytä oikeassa alakulmassa oleva chat-nappi.</p>
                <span className="text-purple-600 font-semibold">Aloita keskustelu</span>
              </div>

              <div className="text-center p-6 bg-orange-50 rounded-2xl border border-orange-200 hover:shadow-lg transition-all cursor-pointer">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Käynti</h3>
                <p className="text-gray-600 mb-4">Tapaaminen toimistollamme. Varaa aika etukäteen.</p>
                <span className="text-orange-600 font-semibold">Helsinki, Finland</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Lähetä viesti
              </h2>
              <p className="text-xl text-gray-600">
                Kerro haasteesi ja vastaamme mahdollisimman nopeasti
              </p>
            </div>

            {!isSubmitted ? (
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nimi *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
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
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@yritys.fi"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yritys
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Yrityksen nimi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Puhelinnumero
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+358 40 123 4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aihe
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Valitse aihe</option>
                        <option value="automaatio">Automation Consulting™</option>
                        <option value="agentit">AI Agent Orchestrator™</option>
                        <option value="chatservice">ChatService™</option>
                        <option value="vatservice">VATService™</option>
                        <option value="kasvu">Growth Suite™</option>
                        <option value="verkkosivut">NextSite™</option>
                        <option value="pilot">Aloita pilotti</option>
                        <option value="demo">Pyydä demo</option>
                        <option value="tuki">Tekninen tuki</option>
                        <option value="muu">Muu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kiireellisyys
                      </label>
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="normal">Normaali (24h vastaus)</option>
                        <option value="high">Kiireellinen (4h vastaus)</option>
                        <option value="emergency">Hätätilanne (1h vastaus)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Viesti *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Kerro haasteestasi tai kysymyksestäsi..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suosimasi yhteydenottotapa
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="email"
                          checked={formData.preferredContact === 'email'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>Sähköposti</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="phone"
                          checked={formData.preferredContact === 'phone'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>Puhelu</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="chat"
                          checked={formData.preferredContact === 'chat'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>Chat</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Lähetetään...' : 'Lähetä viesti'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Lähettämällä viestin hyväksyt tietosuojaselosteen. Emme koskaan jaa tietojasi kolmansille osapuolille.
                  </p>
                </form>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Kiitos viestistäsi!</h3>
                <p className="text-gray-600 mb-6">
                  Olemme vastaanottaneet viestisi ja vastaamme {formData.urgency === 'emergency' ? '1 tunnin' : formData.urgency === 'high' ? '4 tunnin' : '24 tunnin'} sisällä osoitteeseen {formData.email}.
                </p>
                <p className="text-sm text-gray-500">
                  Jos asia on kiireellinen, soita numeroon +358 40 123 4567
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Tutustu tiimiin
              </h2>
              <p className="text-xl text-gray-600">
                Asiantunteva tiimi auttaa sinua saavuttamaan tavoitteesi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">J</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Jukka Virtanen</h3>
                <p className="text-blue-600 font-semibold mb-4">CEO & Perustaja</p>
                <p className="text-gray-600 text-sm">
                  15+ vuotta kokemusta automaatiosta ja liiketoiminnan optimoinnista.
                  Aiemmin toiminut tech-johtajana useissa startup-yrityksissä.
                </p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">S</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sanna Koskinen</h3>
                <p className="text-green-600 font-semibold mb-4">CTO & Teknologiajohtaja</p>
                <p className="text-gray-600 text-sm">
                  AI ja koneoppimisen asiantuntija. Johti kehitystiimiä yli 10 vuotta.
                  Intohimoinen automaation ja tekoälyn hyödyntämisestä liiketoiminnassa.
                </p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">M</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mikael Lindberg</h3>
                <p className="text-purple-600 font-semibold mb-4">Head of Growth</p>
                <p className="text-gray-600 text-sm">
                  Kasvustrategian ja markkinoinnin ekspertti. Auttanut satoja yrityksiä
                  skaalautumaan kansainvälisesti. 12+ vuotta kasvu-markkinoinnin parissa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Usein kysytyt kysymykset
              </h2>
              <p className="text-xl text-gray-600">
                Löydä vastauksia yleisimpiin kysymyksiin
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Kuinka nopeasti saan vastauksen viestiini?
                </h3>
                <p className="text-gray-600">
                  Normaalit yhteydenotot saavat vastauksen 24 tunnin sisällä. Kiireellisissä asioissa 4 tunnin sisällä ja hätätilanteissa 1 tunnin sisällä.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Tarjoatteko ilmaisen konsultaation?
                </h3>
                <p className="text-gray-600">
                  Kyllä! Tarjoamme 30-60 minuutin ilmaisen konsultaation jokaiselle uudelle asiakkaalle. Tämän aikana analysoimme yrityksesi tarpeet ja ehdotamme parasta ratkaisua.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Toimitteko vain Suomessa?
                </h3>
                <p className="text-gray-600">
                  Pääasiallisesti toimimme Suomessa, mutta palvelumme ovat käytettävissä myös kansainvälisesti. Ota yhteyttä ja kartoitetaan mahdollisuudet.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Mitkä ovat takuutteenne?
                </h3>
                <p className="text-gray-600">
                  Tarjoamme 30 päivän tyytyväisyystakuun kaikille palveluillemme. Jos et ole tyytyväinen, palautamme rahasi tai korjaamme ongelmat ilmaiseksi.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Kuinka paljon palvelunne maksavat?
                </h3>
                <p className="text-gray-600">
                  Hinnat riippuvat projektin laajuudesta ja monimutkaisuudesta. Useimmat ratkaisumme maksavat €200-2000 kuukaudessa. Pyydä ilmainen tarjous saadaksesi tarkan hinnan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatBot />
    </div>
  )
}
