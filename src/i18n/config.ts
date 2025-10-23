import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import it from './locales/it.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

// Language resources
const resources = {
  it: { translation: it },
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
};

// Supported languages
export const supportedLanguages = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
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
    fallbackLng: 'it', // Default language
    supportedLngs: ['it', 'en', 'fr', 'ar'],

    // Imposta lingua default per evitare "civet" bug
    lng: 'it',

    // Non fallback a sviluppo chiavi
    returnEmptyString: false,
    returnNull: false,

    // Debug solo in development
    debug: false,

    // Language detection options
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language
      caches: ['localStorage'],
      // Local storage key
      lookupLocalStorage: 'neip-language',
      // Convert language codes (en-US -> en)
      convertDetectedLanguage: (lng) => lng.split('-')[0],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React i18next options
    react: {
      useSuspense: false, // Disable suspense for smoother loading
      // Bind i18n to component
      bindI18n: 'languageChanged',
      bindI18nStore: 'added',
    },

    // Load strategy
    load: 'languageOnly', // Load only 'en' instead of 'en-US'
  });

export default i18n;
