"use client"
import { useState } from "react"
import Success from "./Success"

export default function PilotForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "" })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      setSent(true)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setLoading(false)
    }
  }

  if (sent) return <Success message="Kiitos! Olemme sinuun pian yhteydessä." />

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left max-w-md mx-auto">
      <input
        type="text"
        placeholder="Yrityksen nimi"
        required
        className="w-full border px-4 py-2 rounded"
        onChange={(e) => setForm({ ...form, company: e.target.value })}
      />
      <input
        type="text"
        placeholder="Yhteyshenkilö"
        required
        className="w-full border px-4 py-2 rounded"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Sähköposti"
        required
        className="w-full border px-4 py-2 rounded"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Lähetetään..." : "Lähetä ilmoittautuminen"}
      </button>
    </form>
  )
}