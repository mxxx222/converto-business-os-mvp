"use client"

import { useState } from "react"
import { useConversionTracking } from "@/lib/conversion-tracking"
import { crmIntegration } from "@/lib/crm-integration"
import { trackPilotSignup } from "@/lib/analytics/posthog"

export default function PilotForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", document_types: [] as string[] })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { trackPilot } = useConversionTracking()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validate document types
    if (form.document_types.length === 0) {
      setError('Valitse vähintään yksi dokumenttityyppi')
      return
    }
    
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/pilot-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error("Lomakkeen lähetys epäonnistui")
      }

      setSent(true)
      
      // Track PostHog event
      trackPilotSignup(form.email, 'pilot_form')
      
      // Create CRM lead
      await crmIntegration.createLead({
        name: form.name,
        email: form.email,
        company: form.company,
        source: 'pilot_form',
        stage: 'pilot',
        document_types: form.document_types,
      })
      
      // Track conversion
      trackPilot('landing', { company: form.company, document_types: form.document_types })
      
      setForm({ name: "", email: "", company: "", document_types: [] })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Virhe tapahtui")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="card-feature max-w-md mx-auto text-center">
        <div className="success-checkmark mx-auto mb-4">
          ✓
        </div>
        <h3 className="text-display-sm mb-2">Kiitos ilmoittautumisesta!</h3>
        <p className="text-gray-600 mb-4">
          Olemme lähettäneet vahvistuksen sähköpostiisi ja otamme yhteyttä 24 tunnin sisällä.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span>✓ Demo-kutsu tulossa</span>
          <span>✓ 30pv ilmainen pilotti</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card-feature max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-display-sm mb-2">Aloita 30 päivän ilmainen pilotti</h3>
        <p className="text-gray-600">Ei sitoutumista. Ei luottokorttia. Täysi pääsy kaikkiin ominaisuuksiin.</p>
      </div>

      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-800 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yrityksen nimi
          </label>
          <input
            type="text"
            placeholder="Esim. Oy Yritys Ab"
            required
            className="form-input"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yhteyshenkilö
          </label>
          <input
            type="text"
            placeholder="Etunimi Sukunimi"
            required
            className="form-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Työposti
          </label>
          <input
            type="email"
            placeholder="nimi@yritys.fi"
            required
            className="form-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Document Types Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mitä dokumentteja käsittelette? (valitse kaikki sopivat) *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: 'purchase_invoices', label: 'Ostolaskut', icon: '📄' },
              { value: 'receipts', label: 'ALV-kuitit', icon: '🧾' },
              { value: 'delivery_notes', label: 'Rahtikirjat', icon: '📦' },
              { value: 'order_confirmations', label: 'Tilausvahvistukset', icon: '✅' },
              { value: 'contracts', label: 'Sopimukset', icon: '💼' },
              { value: 'other', label: 'Muut', icon: '📋' },
            ].map((docType) => {
              const isSelected = form.document_types.includes(docType.value);
              return (
                <label
                  key={docType.value}
                  className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-300 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={docType.value}
                    checked={isSelected}
                    onChange={(e) => {
                      const current = form.document_types;
                      const updated = e.target.checked
                        ? [...current, docType.value]
                        : current.filter(t => t !== docType.value);
                      setForm({ ...form, document_types: updated });
                    }}
                    className="sr-only"
                  />
                  <div className="text-2xl mb-1">{docType.icon}</div>
                  <div className="text-xs font-medium">{docType.label}</div>
                </label>
              );
            })}
          </div>
          {form.document_types.length === 0 && (
            <p className="text-xs text-red-600 mt-2">Valitse vähintään yksi dokumenttityyppi</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            💡 Valitse kaikki jotka käsittelette - näytämme ne demo:ssa!
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full hover-lift"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="loading-skeleton w-4 h-4 rounded-full"></div>
              Lähetetään...
            </div>
          ) : (
            <>
              Aloita ilmainen pilotti
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          Rekisteröitymällä hyväksyt <a href="/terms" className="text-primary-600 hover:underline">käyttöehdot</a> ja <a href="/privacy" className="text-primary-600 hover:underline">tietosuojakäytännön</a>.
        </p>
      </form>
    </div>
  )
}