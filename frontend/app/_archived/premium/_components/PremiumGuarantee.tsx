"use client"

export default function PremiumGuarantee(): JSX.Element {
  return (
    <section className="premium-guarantee">
      <div className="container">
        <div className="guarantee-content">
          <div className="guarantee-header">
            <h2 className="guarantee-title">
              Riski on meillä, ei sinulla
            </h2>
            <p className="guarantee-subtitle">
              Olemme niin varmoja että Converto muuttaa yrityksesi, 
              että tarjoamme sinulle täyden rahat takaisin -takuun.
            </p>
          </div>

          <div className="guarantee-features">
            <div className="guarantee-item">
              <div className="guarantee-icon">🛡️</div>
              <div className="guarantee-text">
                <h3>30 päivän rahat takaisin -takuu</h3>
                <p>
                  Jos et ole 100% tyytyväinen, palautamme rahasi kokonaan. 
                  Ei kysymyksiä, ei ongelmia.
                </p>
              </div>
            </div>

            <div className="guarantee-item">
              <div className="guarantee-icon">⚡</div>
              <div className="guarantee-text">
                <h3>Tulokset 24 tunnissa</h3>
                <p>
                  Jos et näe tuloksia ensimmäisen päivän aikana, 
                  palautamme rahasi heti.
                </p>
              </div>
            </div>

            <div className="guarantee-item">
              <div className="guarantee-icon">🎯</div>
              <div className="guarantee-text">
                <h3>Säästä 20+ tuntia tai rahat takaisin</h3>
                <p>
                  Jos et säästä vähintään 20 tuntia ensimmäisessä viikossa, 
                  palautamme rahasi.
                </p>
              </div>
            </div>

            <div className="guarantee-item">
              <div className="guarantee-icon">💯</div>
              <div className="guarantee-text">
                <h3>100% tyytyväisyystakuu</h3>
                <p>
                  Olemme niin varmoja tuotteestamme, että tarjoamme 
                  täyden tyytyväisyystakuun.
                </p>
              </div>
            </div>
          </div>

          <div className="guarantee-cta">
            <h3 className="cta-title">Mikä on sinun riskisi?</h3>
            <p className="cta-subtitle">
              Pahimmassa tapauksessa saat rahasi takaisin. 
              Parhaassa tapauksessa tuplaat tuottavuutesi.
            </p>
            <a href="#pricing" className="btn btn-primary btn-lg">
              Aloita riskittömästi
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
