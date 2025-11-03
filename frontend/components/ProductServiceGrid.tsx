"use client"

import Link from "next/link"

export default function ProductServiceGrid() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Yksi brändi, kaikki ratkaisut
          </h2>
          <p className="text-xl text-gray-600">
            Converto Solutions – Automate your entire business stack
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Business OS */}
          <div className="p-8 bg-white rounded-2xl shadow-lg border-2 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">🧭</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Business OS™
                </h3>
                <p className="text-sm text-gray-500">Lippulaiva</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Automatisoi koko yrityksesi yhdellä alustalla. OCR-kuittien käsittely,
              ALV-laskelmat, ChatService™ ja enemmän.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>OCR + ALV (Vero.fi -integroitu)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>ChatService™ (GPT-5)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>Automation & Workflows</span>
              </div>
            </div>
            <Link
              href="/business-os"
              className="inline-block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Kokeile ilmaiseksi →
            </Link>
          </div>

          {/* Services */}
          <div className="p-8 bg-white rounded-2xl shadow-lg border-2 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">⚙️</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Automaatio- ja koodauspalvelut
                </h3>
                <p className="text-sm text-gray-500">5 ROI-pakettia</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Räätälöity automaatio ja koodauspalvelut yrityksellesi.
              3 kk ROI -paketit, jotka maksavat itsensä takaisin.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>AI Agent Setup (+200% ROI)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>Automation Suite (+150% ROI)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>Next.js Web Launch (+100% ROI)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>CRM Integration (+80% ROI)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>Consulting (+250% ROI)</span>
              </div>
            </div>
            <Link
              href="/services"
              className="inline-block w-full text-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Katso palvelupaketit →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
