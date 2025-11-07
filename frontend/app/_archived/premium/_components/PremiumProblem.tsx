"use client"

export default function PremiumProblem(): JSX.Element {
  return (
    <section className="premium-problem">
      <div className="container">
        <div className="problem-content">
          {/* Problem Headline - StoryBrand "Problem" */}
          <h2 className="problem-title">
            Kyllästyitkö jo siihen, että yrityksesi pyörii sinun ympärilläsi?
          </h2>

          <p className="problem-subtitle">
            Jos olet kuin useimmat yrittäjät, käytät liikaa aikaa rutiinitehtäviin 
            ja liian vähän kasvattamaan yritystäsi.
          </p>

          {/* Problem List - Pain Points */}
          <div className="problem-list">
            <div className="problem-item">
              <div className="problem-icon">😤</div>
              <div className="problem-text">
                <h3>Käytät 40+ tuntia viikossa paperityöhön</h3>
                <p>Laskujen käsittely, asiakastietojen hallinta, raporttien teko - kaikki käsin.</p>
              </div>
            </div>

            <div className="problem-item">
              <div className="problem-icon">😰</div>
              <div className="problem-text">
                <h3>Pelkäät että jotain unohtuu</h3>
                <p>Muistilistat, kalenterit, Excel-taulukot - ja silti asioita lipsahtaa läpi.</p>
              </div>
            </div>

            <div className="problem-item">
              <div className="problem-icon">😵</div>
              <div className="problem-text">
                <h3>Olet burnoutin partaalla</h3>
                <p>Työskentelet 12h päivässä, mutta et näe tuloksia. Joku muu pitäisi hoitaa rutiinit.</p>
              </div>
            </div>

            <div className="problem-item">
              <div className="problem-icon">💸</div>
              <div className="problem-text">
                <h3>Kustannukset kasvavat, mutta tuottavuus ei</h3>
                <p>Palkkaat lisää henkilöstöä, mutta työmäärä vain kasvaa. Ratkaisu ei ole lisää ihmisiä.</p>
              </div>
            </div>

            <div className="problem-item">
              <div className="problem-icon">🤯</div>
              <div className="problem-text">
                <h3>Teknologia tuntuu liian monimutkaiselta</h3>
                <p>Automaatio-ohjelmat ovat kalliita ja vaikeita käyttää. Tarvitset IT-asiantuntijan.</p>
              </div>
            </div>
          </div>

          {/* Problem CTA */}
          <div className="problem-cta">
            <p className="problem-cta-text">
              <strong>Jos tunnistat itsesi näistä, et ole yksin.</strong><br />
              Suurin osa yrittäjistä kamppailee samoista ongelmista päivittäin.
            </p>
            <a href="#solution" className="btn btn-outline">
              Näytä ratkaisu ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
