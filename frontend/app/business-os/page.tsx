import CTA from "@/components/CTA"

export default function BusinessOSPage() {
  return (
    <div className="min-h-screen">
      <section className="sb-hero">
        <div className="sb-hero-bg"></div>
        <div className="container">
          <h1 className="sb-hero-title">Converto Business OS™</h1>
          <p className="sb-hero-sub">
            SaaS-alusta automaatioon ja analytiikkaan. Yhdistä kaikki yrityksesi prosessit yhdeksi älykkääksi järjestelmäksi.
          </p>
          <div className="sb-cta-row">
            <a href="https://app.converto.fi/signup" className="btn btn-primary">
              Aloita ilmainen kokeilu
            </a>
          </div>
        </div>
      </section>

      <section className="sb-section">
        <div className="container">
          <h2 className="sb-h2">Mitä Business OS sisältää?</h2>
          <div className="sb-grid">
            <div className="sb-card">
              <h3 className="sb-card-title">OCR-kuittien käsittely</h3>
              <p className="sb-card-text">Automatisoitu kuittien skannaus ja ALV-laskenta</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Lakisäädäntöjen seuranta</h3>
              <p className="sb-card-text">Pysy ajan tasalla yrityslainsäädännössä</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Raportointi ja analytiikka</h3>
              <p className="sb-card-text">Automaattiset raportit ja liiketoimintatiedot</p>
            </div>
          </div>
        </div>
      </section>

      <CTA
        title="Valmis automatisoimaan yrityksesi?"
        subtitle="Liity pilottiin ja saat 30 päivää ilmaista käyttöä."
        ctaLabel="Ilmoittaudu pilottiin"
        href="/#pilot"
      />
    </div>
  )
}