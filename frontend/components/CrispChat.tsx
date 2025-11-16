'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    $crisp: any;
    CRISP_WEBSITE_ID: string;
  }
}

export function CrispChat() {
  useEffect(() => {
    // Only load in production or when CRISP_WEBSITE_ID is set
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    if (!websiteId) return;

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;

    // Load Crisp chat script
    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.getElementsByTagName('head')[0].appendChild(script);

    // Configure Crisp with Finnish settings
    script.onload = () => {
      if (window.$crisp) {
        // Set Finnish language
        window.$crisp.push(['set', 'session:data', { locale: 'fi' }]);
        
        // Auto-greeting in Finnish (15 seconds delay)
        setTimeout(() => {
          window.$crisp.push([
            'do', 
            'message:send', 
            ['text', 'Hei! 👋 Tarvitsetko apua DocFlow:n kanssa? Vastaamme 2 minuutissa arkisin 9-17.']
          ]);
        }, 15000);

        // Set availability message
        window.$crisp.push([
          'set', 
          'session:data', 
          { 
            availability: 'Vastaamme arkisin 9-17, viikonloppuisin 24h sisällä' 
          }
        ]);
      }
    };

    // Cleanup function
    return () => {
      // Remove script if component unmounts
      const existingScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
}

// Utility function to open chat programmatically
export function openCrispChat() {
  if (typeof window !== 'undefined' && window.$crisp) {
    window.$crisp.push(['do', 'chat:open']);
  }
}

// Utility function to send a message
export function sendCrispMessage(message: string) {
  if (typeof window !== 'undefined' && window.$crisp) {
    window.$crisp.push(['do', 'message:send', ['text', message]]);
  }
}
