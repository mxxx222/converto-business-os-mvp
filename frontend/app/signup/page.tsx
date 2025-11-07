'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type State = 'idle' | 'submitting' | 'success' | 'error'

export default function SignupPage() {
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<string>('business')

  useEffect(() => {
    // Get plan from URL params
    const params = new URLSearchParams(window.location.search)
    const plan = params.get('plan')
    if (plan && ['starter', 'business', 'professional'].includes(plan)) {
      setSelectedPlan(plan)
    }
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setState('submitting')

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/pilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.get('firstName')} ${formData.get('lastName')}`,
          email: formData.get('email'),
          company: formData.get('company'),
          businessId: formData.get('businessId'),
          plan: formData.get('plan'),
          goal: formData.get('goal'),
        }),
      })
      
      if (!res.ok) {
        throw new Error('Rekisteröinti epäonnistui')
      }
      
      setState('success')
    } catch (err: any) {
      setError(err.message || 'Virhe tapahtui. Yritä hetken päästä uudelleen.')
      setState('error')
    }
  }

  const plans = [
    { id: 'starter', name: 'Starter', price: '149 €/kk', desc: '500 dokumenttia/kk' },
    { id: 'business', name: 'Business', price: '299 €/kk', desc: '2 000 dokumenttia/kk', popular: true },
    { id: 'professional', name: 'Professional', price: '499 €/kk', desc: '5 000 dokumenttia/kk' },
  ]

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold">Aloita ilmainen 30 päivän kokeilu</h1>
        <p className="mt-3 text-lg text-slate-600">
          Ei luottokorttia. Peru milloin tahansa. Autamme käyttöönotossa.
        </p>
      </header>

      {state === 'success' ? (
        <div className="mt-12 rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-emerald-900">Tervetuloa DocFlow'hun!</h2>
          <p className="mt-3 text-emerald-800">
            Lähetimme vahvistusviestin sähköpostiisi. Pääset tunnuksillasi DocFlow'n
            onboarding‑ohjelmaan ja voit aloittaa ensimmäisten dokumenttien käsittelyn.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/demo"
              className="rounded-md border border-emerald-300 px-5 py-3 text-emerald-700 hover:bg-emerald-100"
            >
              Varaa käyttöönotto-demo
            </Link>
            <Link
              href="/"
              className="rounded-md bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
            >
              Takaisin etusivulle
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-12 space-y-6">
          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Valitse paketti
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedPlan === plan.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selectedPlan === plan.id}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="sr-only"
                  />
                  {plan.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                      Suosituin
                    </span>
                  )}
                  <div className="text-center">
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-sm text-slate-600">{plan.price}</div>
                    <div className="text-xs text-slate-500">{plan.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Personal Info */}
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
              Työsähköposti *
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
              Yrityksen nimi *
            </label>
            <input
              type="text"
              id="company"
              name="company"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="businessId" className="block text-sm font-medium text-slate-700 mb-1">
              Y‑tunnus (valinnainen)
            </label>
            <input
              type="text"
              id="businessId"
              name="businessId"
              placeholder="1234567-8"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-slate-700 mb-1">
              Tavoite
            </label>
            <textarea
              id="goal"
              name="goal"
              rows={4}
              placeholder="Lyhyesti: mitä haluat automatisoida ensin? (esim. ostolaskut, kuitit, ALV-ilmoitukset)"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {state === 'error' && (
            <div className="rounded-md bg-red-50 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={state === 'submitting'}
            className="w-full rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {state === 'submitting' ? 'Lähetetään…' : 'Luo kokeilutunnus'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Lähettämällä lomakkeen hyväksyt{' '}
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">
              palveluehtomme ja tietosuojaselosteen
            </Link>
            .
          </p>
        </form>
      )}

      {/* Benefits */}
      <section className="mt-16 border-t border-slate-100 pt-16">
        <h2 className="text-xl font-semibold text-center mb-8">Mitä saat kokeilussa?</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚀</span>
            <div>
              <h3 className="font-medium">Täysi käyttöoikeus</h3>
              <p className="text-sm text-slate-600">
                Kaikki ominaisuudet käytössä 30 päivää. Ei rajoituksia.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="font-medium">Henkilökohtainen käyttöönotto</h3>
              <p className="text-sm text-slate-600">
                Autamme integraatioiden kanssa ja opastamme käytössä.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <h3 className="font-medium">Ei luottokorttia</h3>
              <p className="text-sm text-slate-600">
                Ei automaattista laskutusta. Peru milloin tahansa.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🇫🇮</span>
            <div>
              <h3 className="font-medium">Suomenkielinen tuki</h3>
              <p className="text-sm text-slate-600">
                Saat tukea suomeksi sähköpostilla ja puhelimella.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
