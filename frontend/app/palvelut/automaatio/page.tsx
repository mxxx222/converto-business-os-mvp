import CTA from "@/components/CTA"

export default function AutomaatioPage() {
  return (
    <div className="min-h-screen">
      <section className="sb-hero">
        <div className="sb-hero-bg"></div>
        <div className="container">
          <h1 className="sb-hero-title">Automation Consulting™</h1>
          <p className="sb-hero-sub">
            Prosessien auditointi ja automaatioprojektit. Löydämme yrityksesi pullonkaulat ja automatisoimme ne.
          </p>
          <div className="sb-cta-row">
            <a href="/yhteys" className="btn btn-primary">
              Varaa maksuton auditointi
            </a>
          </div>
        </div>
      </section>

      <section className="sb-section">
        <div className="container">
          <h2 className="sb-h2">Mitä tarjoamme?</h2>
          <div className="sb-grid">
            <div className="sb-card">
              <h3 className="sb-card-title">Prosessien auditointi</h3>
              <p className="sb-card-text">Kattava analyysi nykyisistä prosesseista ja niiden tehostamismahdollisuuksista</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Automaatioprojektit</h3>
              <p className="sb-card-text">Täydelliset automaatioratkaisut räätälöityinä yrityksesi tarpeisiin</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Ylläpito ja tuki</h3>
              <p className="sb-card-text">Jatkuva tuki ja ylläpito automaatiolle</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sb-section sb-section-muted">
        <div className="container">
          <h2 className="sb-h2">Hinnasto</h2>
          <div className="sb-card">
            <h3 className="sb-card-title">Automation Consulting™</h3>
            <p className="sb-card-text">790 € + ylläpito 250 €/kk</p>
            <p className="sb-card-foot">Projekti + ylläpito</p>
          </div>
        </div>
      </section>

      <CTA
        title="Valmis automatisoimaan?"
        subtitle="Aloita maksuttomalla prosessien auditoinnilla."
        ctaLabel="Varaa auditointi"
        href="/yhteys"
      />
    </div>
  )
}