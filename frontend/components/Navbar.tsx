"use client"

import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="nav-modern">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CONVERTO</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" className="nav-link">
              Etusivu
            </Link>
            <Link href="/business-os" className="nav-link">
              Business OS
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button className="nav-link flex items-center gap-1">
                Palvelut
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <Link href="/services" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border-b border-gray-100">
                    <div className="font-medium">Kaikki palvelut</div>
                  </Link>
                  <Link href="/services/ai-agents" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <div className="font-medium">AI Agentit</div>
                    <div className="text-xs text-gray-500">+200% ROI</div>
                  </Link>
                  <Link href="/services/automation" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <div className="font-medium">Automaatio</div>
                    <div className="text-xs text-gray-500">+150% ROI</div>
                  </Link>
                  <Link href="/services/web-dev" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <div className="font-medium">Next.js Web</div>
                    <div className="text-xs text-gray-500">+100% ROI</div>
                  </Link>
                  <Link href="/services/crm-integration" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <div className="font-medium">CRM Integration</div>
                    <div className="text-xs text-gray-500">+80% ROI</div>
                  </Link>
                  <Link href="/services/consulting" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <div className="font-medium">Consulting</div>
                    <div className="text-xs text-gray-500">+250% ROI</div>
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/case-studies" className="nav-link">
              Case Studies
            </Link>
            <Link href="/compare" className="nav-link">
              Vertaa
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="https://app.converto.fi/login" className="btn-secondary text-sm">
              Kirjaudu
            </Link>
            <Link href="/business-os/pilot" className="btn-primary text-sm">
              Aloita ilmaiseksi
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Etusivu
              </Link>
              <Link href="/business-os" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Business OS
              </Link>
              <div className="px-4 py-2 text-gray-700 font-semibold">Palvelut</div>
              <Link href="/services" className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Kaikki palvelut
              </Link>
              <Link href="/services/ai-agents" className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                AI Agentit
              </Link>
              <Link href="/services/automation" className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Automaatio
              </Link>
              <Link href="/services/web-dev" className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Next.js Web
              </Link>
              <Link href="/services/crm-integration" className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                CRM Integration
              </Link>
              <Link href="/services/consulting" className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Consulting
              </Link>
              <Link href="/case-studies" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Case Studies
              </Link>
              <Link href="/compare" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Vertaa
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link href="https://app.converto.fi/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Kirjaudu
                </Link>
                <Link href="/business-os/pilot" className="block px-4 py-2 bg-primary-600 text-white rounded-lg text-center font-medium">
                  Aloita ilmaiseksi
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
