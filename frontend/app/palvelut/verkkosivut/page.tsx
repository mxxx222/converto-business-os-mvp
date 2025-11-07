import CTA from "@/components/CTA"

export default function VerkkosivutPage() {
  return (
    <div className="min-h-screen">
      <section className="sb-hero">
        <div className="sb-hero-bg"></div>
        <div className="container">
          <h1 className="sb-hero-title">NextSite™</h1>
          <p className="sb-hero-sub">
            Next.js-verkkosivut ja ylläpito. Modernit, nopeasti latautuvat verkkosivut yrityksellesi.
          </p>
          <div className="sb-cta-row">
            <a href="/yhteys" className="btn btn-primary">
              Pyydä tarjous
            </a>
          </div>
        </div>
      </section>

      <section className="sb-section">
        <div className="container">
          <h2 className="sb-h2">Mitä NextSite sisältää?</h2>
          <div className="sb-grid">
            <div className="sb-card">
              <h3 className="sb-card-title">Next.js Teknologia</h3>
              <p className="sb-card-text">Moderni React-pohjainen kehys nopeille verkkosivuille</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">SEO-optimoitu</h3>
              <p className="sb-card-text">Hakukoneoptimoitu rakenne parhaalle näkyvyydelle</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Ylläpito ja tuki</h3>
              <p className="sb-card-text">Jatkuva ylläpito ja päivitykset</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sb-section sb-section-muted">
        <div className="container">
          <h2 className="sb-h2">Hinnasto</h2>
          <div className="sb-grid">
            <div className="sb-card">
              <h3 className="sb-card-title">Launch</h3>
              <p className="sb-card-text">1 490 €</p>
              <p className="sb-card-foot">Perustoteutus</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Growth</h3>
              <p className="sb-card-text">2 990 €</p>
              <p className="sb-card-foot">Laajennettu toteutus</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Ylläpito</h3>
              <p className="sb-card-text">190 €/kk</p>
              <p className="sb-card-foot">Kuukausittainen ylläpito</p>
            </div>
          </div>
        </div>
      </section>

      <CTA
        title="Valmis modernille verkkosivustolle?"
        subtitle="NextSite™ yhdistää nopeuden, kauneuden ja toiminnallisuuden."
        ctaLabel="Pyydä tarjous"
        href="/yhteys"
      />
    </div>
  )
}