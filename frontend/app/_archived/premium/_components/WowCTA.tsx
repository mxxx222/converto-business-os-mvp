import Link from 'next/link'

export default function WowCTA(): JSX.Element {
  return (
    <section id="start" className="sb-section">
      <h2 className="sb-h2">Rakennetaan sivu joka myy</h2>
      <p className="sb-lead">Varaa clarity‑sessio ja muutetaan tarina tuotoksi.</p>
      <div className="sb-cta-row">
        <Link href="#" className="btn btn-primary">Varaa demo</Link>
        <Link href="#plan" className="btn btn-secondary">Katso suunnitelma</Link>
      </div>
    </section>
  )
}


