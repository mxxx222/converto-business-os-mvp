"use client"

import { useState } from "react"
import Link from "next/link"

export default function ROICalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [hourlyRate, setHourlyRate] = useState(50)
  const [currentErrors, setCurrentErrors] = useState(2)
  const [errorCost, setErrorCost] = useState(5000)

  // Calculate savings
  const timeSaved = hoursPerWeek * 52 * hourlyRate // Per year
  const errorSavings = currentErrors * errorCost // Per year
  const totalSavings = timeSaved + errorSavings
  const monthlySavings = Math.round(totalSavings / 12)
  const roiMonths = Math.round(99 / monthlySavings * 12) || 1

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Laske säästösi
          </h2>
          <p className="text-xl text-gray-600">
            Interaktiivinen ROI-laskuri – katso kuinka paljon säästät
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Sinun tilanteesi</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kuinka monta tuntia kirjanpito vie viikossa?
                </label>
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tuntipalkka (€)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="20"
                  max="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veroilmoitusten virheet/vuosi
                </label>
                <input
                  type="number"
                  value={currentErrors}
                  onChange={(e) => setCurrentErrors(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Virheen keskimääräinen kustannus (€)
                </label>
                <input
                  type="number"
                  value={errorCost}
                  onChange={(e) => setErrorCost(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1000"
                  max="50000"
                  step="500"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-2xl shadow-lg text-white">
            <h3 className="text-xl font-bold mb-6">Säästösi vuodessa</h3>

            <div className="space-y-6">
              <div className="bg-white bg-opacity-20 rounded-xl p-6">
                <div className="text-sm opacity-90 mb-2">Ajan säästö</div>
                <div className="text-4xl font-bold">
                  {timeSaved.toLocaleString('fi-FI')} €
                </div>
                <div className="text-sm opacity-75 mt-2">
                  {hoursPerWeek * 52} tuntia/vuosi × {hourlyRate}€/h
                </div>
              </div>

              <div className="bg-white bg-opacity-20 rounded-xl p-6">
                <div className="text-sm opacity-90 mb-2">Virheiden välttäminen</div>
                <div className="text-4xl font-bold">
                  {errorSavings.toLocaleString('fi-FI')} €
                </div>
                <div className="text-sm opacity-75 mt-2">
                  {currentErrors} virhettä × {errorCost.toLocaleString('fi-FI')}€
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 text-gray-900">
                <div className="text-sm text-gray-600 mb-2">Kokonaissäästö/vuosi</div>
                <div className="text-5xl font-bold text-blue-600">
                  {totalSavings.toLocaleString('fi-FI')} €
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  ≈ {monthlySavings.toLocaleString('fi-FI')} €/kk
                </div>
              </div>

              <div className="bg-white bg-opacity-20 rounded-xl p-6">
                <div className="text-sm opacity-90 mb-2">ROI (Business OS 99€/kk)</div>
                <div className="text-3xl font-bold">
                  {roiMonths} kk
                </div>
                <div className="text-sm opacity-75 mt-2">
                  Takaisinmaksuaika
                </div>
              </div>

              <Link
                href="/business-os/pilot"
                className="block w-full text-center px-6 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Aloita ilmainen 30pv pilotti →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
