"use client"

import Link from "next/link"

export default function StickyPilotCTA() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link
        href="https://pilot.converto.fi"
        className="btn-primary shadow-lg hover:shadow-xl transition-all animate-pulse hover:animate-none"
        onClick={() => {
          // Track sticky CTA click
          if (typeof window !== 'undefined' && window.plausible) {
            window.plausible('Sticky CTA Click', {
              props: { source: 'sticky-cta', destination: 'pilot.converto.fi' }
            })
          }
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'sticky_cta_click', {
              event_category: 'conversion',
              event_label: 'pilot.converto.fi'
            })
          }
        }}
      >
        Aloita pilotti →
      </Link>
    </div>
  )
}

