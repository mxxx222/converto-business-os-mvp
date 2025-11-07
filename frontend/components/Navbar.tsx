'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  
  return (
    <nav className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-extrabold text-slate-900">
          DocFlow
        </Link>
        <button 
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <ul className="hidden items-center gap-6 md:flex">
          <li>
            <Link 
              href="/pricing"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Hinnasto
            </Link>
          </li>
          <li>
            <Link 
              href="/integrations"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Integraatiot
            </Link>
          </li>
          <li>
            <Link 
              href="/security"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Tietoturva
            </Link>
          </li>
          <li>
            <Link 
              href="/contact"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Yhteys
            </Link>
          </li>
          <li>
            <Link
              href="/signup"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
            >
              Kokeile ilmaiseksi
            </Link>
          </li>
        </ul>
      </div>
      {open && (
        <ul className="space-y-2 border-t border-slate-100 px-6 py-4 md:hidden">
          <li>
            <Link 
              href="/pricing"
              className="block py-2 text-slate-600 hover:text-slate-900"
              onClick={() => setOpen(false)}
            >
              Hinnasto
            </Link>
          </li>
          <li>
            <Link 
              href="/integrations"
              className="block py-2 text-slate-600 hover:text-slate-900"
              onClick={() => setOpen(false)}
            >
              Integraatiot
            </Link>
          </li>
          <li>
            <Link 
              href="/security"
              className="block py-2 text-slate-600 hover:text-slate-900"
              onClick={() => setOpen(false)}
            >
              Tietoturva
            </Link>
          </li>
          <li>
            <Link 
              href="/contact"
              className="block py-2 text-slate-600 hover:text-slate-900"
              onClick={() => setOpen(false)}
            >
              Yhteys
            </Link>
          </li>
          <li>
            <Link 
              href="/signup"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => setOpen(false)}
            >
              Kokeile ilmaiseksi
            </Link>
          </li>
        </ul>
      )}
    </nav>
  )
}