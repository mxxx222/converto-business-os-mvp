import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-white font-semibold">DocFlow by Converto</h3>
            <p className="mt-2 text-sm">
              Automatisoi dokumentit AI:lla
              <br />
              Turku, Finland
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Tuote</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li><Link href="/pricing" className="hover:text-white transition-colors">Hinnasto</Link></li>
              <li><Link href="/integrations" className="hover:text-white transition-colors">Integraatiot</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Tietoturva</Link></li>
              <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Yritys</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Tietosuoja</Link></li>
              <li><Link href="/legal/dpa" className="hover:text-white transition-colors">DPA</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Yhteys</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Tuki</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>support@converto.fi</li>
              <li>+358 ...</li>
              <li><a href="https://linkedin.com/company/converto" className="hover:text-white transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Converto Oy. Kaikki oikeudet pidätetään.
        </p>
      </div>
    </footer>
  )
}