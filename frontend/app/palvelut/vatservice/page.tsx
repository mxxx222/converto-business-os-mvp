import CTA from "@/components/CTA"

export default function VATServicePage() {
  return (
    <div className="min-h-screen">
      <section className="sb-hero">
        <div className="sb-hero-bg"></div>
        <div className="container">
          <h1 className="sb-hero-title">VATService™</h1>
          <p className="sb-hero-sub">
            ALV-automaatiot yrityksille. Automatisoi ALV-laskelmat ja raportointi täysin.
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
          <h2 className="sb-h2">VATService™ ominaisuudet</h2>
          <div className="sb-grid">
            <div className="sb-card">
              <h3 className="sb-card-title">Automaattiset ALV-laskelmat</h3>
              <p className="sb-card-text">Kuittien perusteella automaattiset ALV-vähennykset</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">ALV-raportointi</h3>
              <p className="sb-card-text">Automaattiset raportit ja ilmoitukset verottajalle</p>
            </div>
            <div className="sb-card">
              <h3 className="sb-card-title">Verooptimointi</h3>
              <p className="sb-card-text">Älykkäät vinkit verosuunnitteluun</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sb-section sb-section-muted">
        <div className="container">
          <h2 className="sb-h2">Hinnasto</h2>
          <div className="sb-card">
            <h3 className="sb-card-title">VATService™</h3>
            <p className="sb-card-text">Setup 990 € + 290 €/kk</p>
            <p className="sb-card-foot">API-palvelu</p>
          </div>
        </div>
      </section>

      <CTA
        title="Valmis automatisoimaan ALV-käsittelyn?"
        subtitle="VATService™ säästää aikaa ja vähentää virheitä."
        ctaLabel="Aloita demo"
        href="https://app.converto.fi/demo"
      />
    </div>
  )
}