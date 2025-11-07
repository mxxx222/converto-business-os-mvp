'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'

export default function WowHero(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start','end start'] })
  const y = useTransform(scrollYProgress, [0,1], [0,-60])
  const filter = useTransform(scrollYProgress, [0,1], ['blur(0px)','blur(8px)'])

  return (
    <section ref={ref} className="sb-hero">
      <motion.div style={{ y, filter }} className="sb-hero-bg" />
      <h1 className="sb-hero-title gradient-text">Selkeyttä joka konvertoi</h1>
      <p className="sb-hero-sub">Muuta tarinasi myyväksi SaaS‑kokemukseksi – nopeasti ja laadukkaasti.</p>
      <div className="sb-cta-row">
        <Link href="#start" className="btn btn-primary">Aloita pilotti</Link>
        <Link href="#solution" className="btn btn-secondary">Lue lisää</Link>
      </div>
    </section>
  )
}


