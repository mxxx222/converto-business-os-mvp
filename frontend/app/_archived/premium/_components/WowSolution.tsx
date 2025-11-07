export default function WowSolution(): JSX.Element {
  return (
    <section id="solution" className="sb-section">
      <h2 className="sb-h2">StoryBrand‑kokonaisuus joka toimii</h2>
      <p className="sb-lead">Asiakaslähtöinen narratiivi + moderni design + konversio‑UX.</p>
      <div className="sb-grid">
        {[{t:'Selkeytä',d:'Viesti joka ymmärretään sekunneissa.'},{t:'Suunnittele',d:'Premium‑ilme ilman raskautta.'},{t:'Konvertoi',d:'Funnel ja CTA:t jotka toimivat.'}].map(x=> (
          <div className="sb-card" key={x.t}>
            <h3 className="sb-card-title">{x.t}</h3>
            <p className="sb-card-text">{x.d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}


