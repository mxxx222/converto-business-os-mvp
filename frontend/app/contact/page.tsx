'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) {
        throw new Error('Viestin lähetys epäonnistui')
      }
      
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Virhe tapahtui. Yritä uudelleen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold">Ota yhteyttä</h1>
        <p className="mt-3 text-lg text-slate-600">
          Vastaamme 1 arkipäivän kuluessa. Enterprise-asiakkaat saavat prioriteettituen.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <div>
          {sent ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-emerald-900">Kiitos viestistäsi!</h2>
              <p className="mt-2 text-emerald-700">
                Olemme vastaanottaneet yhteydenottosi ja vastaamme sinulle pian.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                    Etunimi *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                    Sukunimi *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Sähköposti *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
                  Yritys
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">
                  Aihe
                </label>
                <select
                  id="topic"
                  name="topic"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="general">Yleinen kysymys</option>
                  <option value="enterprise">Enterprise-myynti</option>
                  <option value="integration-request">Integraatiopyyntö</option>
                  <option value="security">Tietoturva</option>
                  <option value="support">Tekninen tuki</option>
                  <option value="billing">Laskutus</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                  Viesti *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Kerro, miten voimme auttaa..."
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Lähetetään...' : 'Lähetä viesti'}
              </button>

              <p className="text-xs text-slate-500">
                Lähettämällä lomakkeen hyväksyt{' '}
                <a href="/legal/privacy" className="text-blue-600 hover:underline">
                  tietosuojaselosteen
                </a>
                .
              </p>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50">
            <h2 className="text-xl font-semibold mb-4">Yhteystiedot</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="font-medium">Sähköposti</p>
                  <p className="text-slate-600">support@converto.fi</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">📞</span>
                <div>
                  <p className="font-medium">Puhelin</p>
                  <p className="text-slate-600">+358 ...</p>
                  <p className="text-sm text-slate-500">Ma-Pe 9-17</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-medium">Osoite</p>
                  <p className="text-slate-600">
                    Converto Oy<br />
                    Turku, Finland
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-3">Nopeat linkit</h3>
            <div className="space-y-3">
              <a
                href="/demo"
                className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
              >
                <span>📅</span>
                <span>Varaa 15 min demo</span>
              </a>
              <a
                href="/signup"
                className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
              >
                <span>🚀</span>
                <span>Aloita ilmainen kokeilu</span>
              </a>
              <a
                href="/legal/dpa"
                className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
              >
                <span>📄</span>
                <span>Lataa DPA-pohja</span>
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Enterprise-asiakkaat</h3>
            <p className="text-blue-800 text-sm">
              Tarvitsetko SLA:n, on-prem-asennuksen tai white-label-ratkaisun? 
              Ota yhteyttä enterprise-myyntiin suoraan.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
