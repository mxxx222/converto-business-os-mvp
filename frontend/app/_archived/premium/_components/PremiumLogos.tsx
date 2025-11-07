"use client"

export default function PremiumLogos(): JSX.Element {
  const logos = [
    { name: "Nordea", logo: "🏦" },
    { name: "OP", logo: "🏛️" },
    { name: "Danske Bank", logo: "🏦" },
    { name: "S-Pankki", logo: "🏪" },
    { name: "Aktia", logo: "🏦" },
    { name: "Handelsbanken", logo: "🏦" }
  ]

  return (
    <section className="premium-logos">
      <div className="container">
        <div className="logos-content">
          <p className="logos-text">
            Luotettavat pankit ja yli 100 integraatiota
          </p>
          <div className="logos-grid">
            {logos.map((logo, index) => (
              <div key={index} className="logo-item">
                <div className="logo-icon">{logo.logo}</div>
                <span className="logo-name">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
