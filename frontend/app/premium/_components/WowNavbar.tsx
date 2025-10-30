'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function WowNavbar(): JSX.Element {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={[
      'sticky top-0 z-40 transition-all',
      scrolled ? 'backdrop-blur-xl bg-white/70 border-b border-black/10' : 'bg-transparent'
    ].join(' ')}>
      <nav className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:64}}>
        <Link href="#" className="gradient-text" style={{fontWeight:800}}>Converto</Link>
        <div style={{display:'none'}} className="md:flex items-center gap-6">
          <a href="#problem" className="opacity-80 hover-scale">Haaste</a>
          <a href="#solution" className="opacity-80 hover-scale">Ratkaisu</a>
          <a href="#plan" className="opacity-80 hover-scale">Suunnitelma</a>
        </div>
        <a href="#start" className="btn btn-primary">Aloita pilotti</a>
      </nav>
    </header>
  )
}


