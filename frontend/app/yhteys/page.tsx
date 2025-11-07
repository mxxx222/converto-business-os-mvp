"use client"
import { useState } from "react"
import Success from "@/components/Success"

export default function YhteysPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    try {
      // For now, just simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSent(true)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center">
      <Success message="Kiitos yhteydenotostasi! Otamme sinuun yhteyttä pian." />
    </div>
  )

  return (
    <div className="min-h-screen">
      <section className="sb-hero">
        <div className="sb-hero-bg"></div>
        <div className="container">
          <h1 className="sb-hero-title">Ota yhteyttä</h1>
          <p className="sb-hero-sub">
            Kerro meille tarpeistasi, niin autamme löytämään parhaan ratkaisun yrityksellesi.
          </p>
        </div>
      </section>

      <section className="sb-section">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nimi
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sähköposti
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yrityksen nimi
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Viesti
                </label>
                <textarea
                  rows={6}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kerro meille miten voimme auttaa..."
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {loading ? "Lähetetään..." : "Lähetä viesti"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}