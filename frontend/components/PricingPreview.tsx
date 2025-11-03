"use client"

import Link from "next/link"

export default function PricingPreview() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Valitse oikea ratkaisu sinulle
          </h2>
          <p className="text-xl text-gray-600">
            Aloita ilmaiseksi tai pyydä tarjous palveluista
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Business OS */}
          <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition-colors">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Business OS
              </h3>
              <p className="text-gray-600">SaaS-tilauspalvelu</p>
            </div>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-gray-900">
                99€
                <span className="text-xl text-gray-600 font-normal">/kk</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Alkaen</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">30 päivää ilmaiseksi</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Ei korttitietoja pilottiin</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Peruuta milloin tahansa</span>
              </li>
            </ul>
            <Link
              href="/business-os/pilot"
              className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Aloita ilmaiseksi 30pv
            </Link>
          </div>

          {/* Services */}
          <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-500 transition-colors">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Palvelupaketit
              </h3>
              <p className="text-gray-600">Räätälöity automaatio</p>
            </div>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-gray-900">
                2000€
                <span className="text-xl text-gray-600 font-normal">+</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">3 kk ROI -paketit</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">AI Agent Setup (+200% ROI)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Automation Suite (+150% ROI)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Henkilökohtainen konsultaatio</span>
              </li>
            </ul>
            <Link
              href="/services"
              className="block w-full text-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Pyydä tarjous
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
