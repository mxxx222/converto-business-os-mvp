interface ProblemProps {
  title: string
  bullets: string[]
}

export default function Problem({ title, bullets }: ProblemProps) {
  return (
    <section className="sb-section sb-section-muted">
      <div className="container">
        <h2 className="sb-h2">{title}</h2>
        <ul className="sb-ol">
          {bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}