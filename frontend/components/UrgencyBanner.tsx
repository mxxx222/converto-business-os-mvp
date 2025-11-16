'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X } from 'lucide-react';

export function UrgencyBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          {/* Pulsing dot */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          
          <span className="font-bold text-sm md:text-base">
            🔥 Beta-ohjelma täyttyy nopeasti - Vain 8 paikkaa jäljellä!
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:shadow-lg transition-all flex-shrink-0"
          >
            Hae Nyt →
          </Link>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Sulje banneri"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
