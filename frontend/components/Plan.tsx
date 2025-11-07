interface Step {
  number: string
  text: string
}

interface PlanProps {
  title: string
  steps: Step[]
}

export default function Plan({ title, steps }: PlanProps) {
  return (
    <section className="sb-section">
      <div className="container">
        <h2 className="sb-h2">{title}</h2>
        <ol className="sb-ol">
          {steps.map((step, index) => (
            <li key={index}>
              <strong>{step.number}.</strong> {step.text}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}