interface CTAProps {
  title: string
  subtitle: string
  ctaLabel: string
  href: string
}

export default function CTA({ title, subtitle, ctaLabel, href }: CTAProps) {
  return (
    <section className="sb-section">
      <div className="container">
        <h2 className="sb-h2">{title}</h2>
        <p className="sb-lead">{subtitle}</p>
        <div className="sb-cta-row">
          <a href={href} className="btn btn-primary">
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}