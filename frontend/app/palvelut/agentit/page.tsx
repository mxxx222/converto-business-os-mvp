import CTA from "@/components/CTA"

export default function AgentitPage() {
  return (
    <div className="min-h-screen">
      <section className="sb-hero">
        <div className="sb-hero-bg"></div>
        <div className="container">
          <h1 className="sb-hero-title">Notion + GPT Agenttipaketit™</h1>
          <p className="sb-hero-sub">
            Viikkosuunnittelija, Verotusagentti, ROI Dashboard. Älykkäät agentit hoitavat rutiinitehtävät puolestasi.
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
          <h2 className="sb-h2">Agenttipaketit</h2>
          <div className="sb-grid">
            <div className="sb-card">
              <h3 className="sb-card-title">Viikkosuunnittelija</h3>
              <p className="sb-card-text">Automaattinen viikkosuunnittelu ja tehtävien priorisointi</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Verotusagentti</h3>
              <p className="sb-card-text">ALV-laskelmat ja verotukseen liittyvät muistutukset</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">ROI Dashboard</h3>
              <p className="sb-card-text">Liiketoiminnan tuottavuuden reaaliaikainen seuranta</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sb-section sb-section-muted">
        <div className="container">
          <h2 className="sb-h2">Hinnasto</h2>
          <div className="sb-card">
            <h3 className="sb-card-title">Notion + GPT Agenttipaketit™</h3>
            <p className="sb-card-text">49–249 €/kk</p>
            <p className="sb-card-foot">Digituote</p>
          </div>
        </div>
      </section>

      <CTA
        title="Valmis älykkäämpään työskentelyyn?"
        subtitle="Agentit hoitavat rutiinit, sinä keskityt tärkeisiin asioihin."
        ctaLabel="Aloita demo"
        href="https://app.converto.fi/demo"
      />
    </div>
  )
}