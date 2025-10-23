import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import it from './locales/it.json';
import en from './locales/en.json';

// Language resources - SOLO ITALIANO E INGLESE
const resources = {
  it: { translation: it },
  en: { translation: en },
};

// Supported languages - SOLO ITALIANO E INGLESE
export const supportedLanguages = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'it',
    supportedLngs: ['it', 'en'],
    lng: 'it',

    // Language detection
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'neip-language',
      convertDetectedLanguage: (lng) => {
        const normalized = lng.split('-')[0];
        // Se non è supportato, usa italiano
        return ['it', 'en'].includes(normalized) ? normalized : 'it';
      },
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    load: 'languageOnly',
  });

export default i18n;
