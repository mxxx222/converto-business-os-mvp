import Image from 'next/image'

interface HeroProps {
  title: string
  subtitle: string
  ctaPrimary: { label: string; href: string }
  image: string
}

export default function Hero({ title, subtitle, ctaPrimary, image }: HeroProps) {
  return (
    <section className="sb-hero">
      <div className="sb-hero-bg"></div>
      <div className="container">
        <h1 className="sb-hero-title">{title}</h1>
        <p className="sb-hero-sub">{subtitle}</p>
        <div className="sb-cta-row">
          <a href={ctaPrimary.href} className="btn btn-primary">
            {ctaPrimary.label}
          </a>
        </div>
        {image && (
          <div className="mt-8">
            <Image
              src={image}
              alt="Converto Business OS"
              width={600}
              height={400}
              className="mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </section>
  )
}