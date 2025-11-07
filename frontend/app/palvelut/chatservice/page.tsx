import CTA from "@/components/CTA"

export default function ChatServicePage() {
  return (
    <div className="min-h-screen">
      <section className="sb-hero">
        <div className="sb-hero-bg"></div>
        <div className="container">
          <h1 className="sb-hero-title">ChatService™</h1>
          <p className="sb-hero-sub">
            GPT-5-pohjainen asiakaspalvelu- ja liidibotti. 24/7 asiakaspalvelu ilman ihmisen väliintuloa.
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
          <h2 className="sb-h2">Miksi ChatService?</h2>
          <div className="sb-grid">
            <div className="sb-card">
              <h3 className="sb-card-title">24/7 Saatavuus</h3>
              <p className="sb-card-text">Asiakaspalvelu toimii ympäri vuorokauden</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">GPT-5 Teknologia</h3>
              <p className="sb-card-text">Edistyksellinen tekoäly ymmärtää asiakkaan tarpeet</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Liidigenerointi</h3>
              <p className="sb-card-text">Automaattinen liidien kerääminen ja kvalifiointi</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sb-section sb-section-muted">
        <div className="container">
          <h2 className="sb-h2">Hinnasto</h2>
          <div className="sb-card">
            <h3 className="sb-card-title">ChatService™</h3>
            <p className="sb-card-text">490–990 €/kk</p>
            <p className="sb-card-foot">Subscription</p>
          </div>
        </div>
      </section>

      <CTA
        title="Valmis parantamaan asiakaspalvelua?"
        subtitle="ChatService™ vastaa kysymyksiin ja kerää liidejä automaattisesti."
        ctaLabel="Aloita demo"
        href="https://app.converto.fi/demo"
      />
    </div>
  )
}