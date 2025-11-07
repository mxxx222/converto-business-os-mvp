"use client"

import { useState, useEffect } from 'react'

export default function PremiumNavbar(): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={`premium-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <a href="/premium" className="brand-link">
            <div className="brand-icon">🚀</div>
            <span className="brand-text">Converto</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          <a 
            href="#features" 
            className="nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}
          >
            Ominaisuudet
          </a>
          <a 
            href="#pricing" 
            className="nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}
          >
            Hinnat
          </a>
          <a 
            href="#testimonials" 
            className="nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}
          >
            Asiakkaat
          </a>
          <a 
            href="#faq" 
            className="nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
          >
            FAQ
          </a>
        </div>

        {/* CTA Buttons */}
        <div className="navbar-actions">
          <a 
            href="#pricing" 
            className="btn btn-outline btn-sm"
            onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}
          >
            Hinnat
          </a>
          <a 
            href="#pilot" 
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.preventDefault(); scrollToSection('pilot'); }}
          >
            Aloita ilmaiseksi
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <a 
            href="#features" 
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}
          >
            Ominaisuudet
          </a>
          <a 
            href="#pricing" 
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}
          >
            Hinnat
          </a>
          <a 
            href="#testimonials" 
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}
          >
            Asiakkaat
          </a>
          <a 
            href="#faq" 
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
          >
            FAQ
          </a>
          <div className="mobile-actions">
            <a 
              href="#pricing" 
              className="btn btn-outline btn-sm"
              onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}
            >
              Hinnat
            </a>
            <a 
              href="#pilot" 
              className="btn btn-primary btn-sm"
              onClick={(e) => { e.preventDefault(); scrollToSection('pilot'); }}
            >
              Aloita ilmaiseksi
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
