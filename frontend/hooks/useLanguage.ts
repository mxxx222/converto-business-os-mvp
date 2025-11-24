import { useState, useEffect } from 'react';

export function useLanguage() {
  const [language, setLanguage] = useState('fi');

  useEffect(() => {
    // Detect from browser or localStorage
    const saved = localStorage.getItem('language');
    const browser = navigator.language.split('-')[0];
    setLanguage(saved || browser || 'fi');
  }, []);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return { language, changeLanguage };
}

