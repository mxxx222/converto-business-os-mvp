'use client';

import { Calendar } from 'lucide-react';

interface CalendlyButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function CalendlyButton({ 
  variant = 'primary', 
  size = 'md',
  text = '📅 Varaa 15min Demo',
  className = ''
}: CalendlyButtonProps) {
  
  const openCalendly = () => {
    // @ts-ignore - Calendly widget will be loaded
    if (typeof window !== 'undefined' && window.Calendly) {
      // @ts-ignore
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/docflow-demo/15min'
      });
    } else {
      // Fallback: Open in new tab
      window.open('https://calendly.com/docflow-demo/15min', '_blank');
    }
  };

  const baseStyles = 'inline-flex items-center gap-2 font-bold rounded-xl transition-all cursor-pointer border-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent hover:shadow-2xl hover:scale-105',
    secondary: 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50',
    outline: 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-10 py-5 text-xl'
  };

  return (
    <button
      onClick={openCalendly}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      type="button"
    >
      <Calendar className="w-5 h-5" />
      {text}
    </button>
  );
}

// Inline Calendly embed component for dedicated pages
export function CalendlyInline({ 
  className = '',
  height = '700px' 
}: { 
  className?: string;
  height?: string;
}) {
  return (
    <div className={className}>
      <div 
        className="calendly-inline-widget" 
        data-url="https://calendly.com/docflow-demo/15min?hide_gdpr_banner=1&primary_color=667eea"
        style={{ minWidth: '320px', height }}
      />
    </div>
  );
}
