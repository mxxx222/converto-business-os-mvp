'use client'

import { useState } from 'react'
// import { Building2, Mail, Phone, Send } from 'lucide-react'

export function BetaSignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      company_name: formData.get('company_name'),
      contact_name: formData.get('contact_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      monthly_invoices: formData.get('monthly_invoices'),
      weekly_feedback_ok: formData.get('weekly_feedback_ok') === 'on',
    }

    try {
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Signup failed')
      }

      setIsSuccess(true)
    } catch (err) {
      setError('Jotain meni pieleen. Yritä uudelleen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-green-900 mb-2">
          Kiitos ilmoittautumisesta! 🎉
        </h3>
        <p className="text-green-700">
          Otamme sinuun yhteyttä 1-2 arkipäivän sisällä.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
      <h3 className="text-2xl font-bold mb-4">Liity Beta-ohjelmaan</h3>
      <p className="text-gray-600 mb-6">
        Täytä alla oleva lomake, niin otamme sinuun yhteyttä.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
            🏢 Yrityksen nimi *
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
            Yhteyshenkilö *
          </label>
          <input
            type="text"
            id="contact_name"
            name="contact_name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            📧 Sähköposti *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            📞 Puhelinnumero
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="monthly_invoices" className="block text-sm font-medium text-gray-700 mb-1">
            Ostolaskuja/kuukausi
          </label>
          <select
            id="monthly_invoices"
            name="monthly_invoices"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="0-50">0-50</option>
            <option value="50-200">50-200</option>
            <option value="200-500">200-500</option>
            <option value="500+">500+</option>
          </select>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="weekly_feedback_ok"
            name="weekly_feedback_ok"
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="weekly_feedback_ok" className="ml-2 block text-sm text-gray-700">
            Haluan osallistua viikkopalautteeseen (suositeltu beta-käyttäjille)
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            'Lähetetään...'
          ) : (
            <>
              📤 Liity beta-ohjelmaan
            </>
          )}
        </button>
      </form>
    </div>
  )
}

