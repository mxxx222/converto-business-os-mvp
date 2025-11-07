"use client"

export default function PremiumTestimonials(): JSX.Element {
  const testimonials = [
    {
      name: "Mika Virtanen",
      company: "Virtanen Consulting",
      role: "Toimitusjohtaja",
      image: "👨‍💼",
      quote: "Converto säästi minulta 25 tuntia viikossa. Nyt voin keskittyä kasvattamaan yritystäni sen sijaan että hoitaisin paperityötä.",
      results: "25h/viikko säästetty"
    },
    {
      name: "Anna Koskinen",
      company: "Koskinen Design",
      role: "Yrittäjä",
      image: "👩‍🎨",
      quote: "En uskonut että automaatio voisi olla näin helppoa. 5 minuutissa oli kaikki kunnossa ja alkoi säästämään aikaa heti.",
      results: "80% vähemmän työtä"
    },
    {
      name: "Jukka Nieminen",
      company: "Nieminen Logistics",
      role: "Toimitusjohtaja",
      image: "👨‍🚛",
      quote: "Laskujen käsittely oli aina kivulias prosessi. Nyt se tapahtuu automaattisesti ja asiakkaat maksavat nopeammin.",
      results: "60% nopeammat maksut"
    },
    {
      name: "Sari Lehtonen",
      company: "Lehtonen Accounting",
      role: "Kirjanpitäjä",
      image: "👩‍💻",
      quote: "Asiakkaani rakastavat sitä että voin keskittyä strategiseen neuvontaan sen sijaan että teen rutiinikirjanpitoa.",
      results: "3x enemmän asiakkaita"
    },
    {
      name: "Timo Rantanen",
      company: "Rantanen Construction",
      role: "Yrittäjä",
      image: "👷‍♂️",
      quote: "Rakennusalalla on paljon hallintoa. Converto automatisoi kaiken niin että voin keskittyä rakentamiseen.",
      results: "€5,000/kk säästö"
    },
    {
      name: "Liisa Mäkinen",
      company: "Mäkinen Marketing",
      role: "Toimitusjohtaja",
      image: "👩‍💼",
      quote: "Asiakasseuranta oli aina haaste. Nyt se tapahtuu automaattisesti ja asiakastyytyväisyys on noussut 40%.",
      results: "40% parempi asiakastyytyväisyys"
    }
  ]

  return (
    <section className="premium-testimonials" id="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">
            Yli 500 yrittäjää on jo automatisoinut yrityksensä
          </h2>
          <p className="testimonials-subtitle">
            Katso mitä he sanovat Converto Business OS:sta
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-content">
                <div className="quote-icon">"</div>
                <p className="testimonial-quote">{testimonial.quote}</p>
                <div className="testimonial-results">
                  <span className="results-badge">{testimonial.results}</span>
                </div>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.image}</div>
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                  <div className="author-company">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="social-proof">
          <div className="proof-stats">
            <div className="proof-stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Aktiivista asiakasta</div>
            </div>
            <div className="proof-stat">
              <div className="stat-number">95%</div>
              <div className="stat-label">Asiakastyytyväisyys</div>
            </div>
            <div className="proof-stat">
              <div className="stat-number">20h</div>
              <div className="stat-label">Keskimäärin säästetty/viikko</div>
            </div>
            <div className="proof-stat">
              <div className="stat-number">€2,000</div>
              <div className="stat-label">Keskimäärin säästö/kk</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="testimonials-cta">
          <h3 className="cta-title">Liity heidän joukkoonsa</h3>
          <p className="cta-subtitle">
            Aloita ilmaiseksi ja näe tulokset 24 tunnissa
          </p>
          <a href="#pricing" className="btn btn-primary btn-lg">
            Aloita ilmaiseksi
          </a>
        </div>
      </div>
    </section>
  )
}
