import fi from './fi.json';
import en from './en.json';

const locales = { fi, en };

export function useSBTranslation(lang: 'fi' | 'en' = 'fi') {
  return locales[lang];
}
