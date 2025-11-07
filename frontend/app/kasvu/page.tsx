import CTA from "@/components/CTA"

export default function KasvuPage() {
  return (
    <div className="min-h-screen">
      <section className="sb-hero">
        <div className="sb-hero-bg"></div>
        <div className="container">
          <h1 className="sb-hero-title">Growth Suite™</h1>
          <p className="sb-hero-sub">
            Markkinoinnin automaatio + liidiseuranta. Kasvata yritystäsi älykkäällä markkinoinnilla.
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
          <h2 className="sb-h2">Growth Suite™ sisältää</h2>
          <div className="sb-grid">
            <div className="sb-card">
              <h3 className="sb-card-title">Markkinoinnin automaatio</h3>
              <p className="sb-card-text">Automaattiset sähköpostikampanjat ja markkinointivirrat</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Liidiseuranta</h3>
              <p className="sb-card-text">Liidien seuraaminen ja kvalifiointi automaattisesti</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Analytiikka ja raportointi</h3>
              <p className="sb-card-text">Markkinoinnin ROI:n reaaliaikainen seuranta</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sb-section sb-section-muted">
        <div className="container">
          <h2 className="sb-h2">Hinnasto</h2>
          <div className="sb-card">
            <h3 className="sb-card-title">Growth Suite™</h3>
            <p className="sb-card-text">390–690 €/kk</p>
            <p className="sb-card-foot">Subscription</p>
          </div>
        </div>
      </section>

      <CTA
        title="Valmis kasvattamaan yritystäsi?"
        subtitle="Growth Suite™ tuo enemmän liidejä ja asiakkaita automaattisesti."
        ctaLabel="Aloita demo"
        href="https://app.converto.fi/demo"
      />
    </div>
  )
}