import { useTranslation as useOriginalTranslation } from 'react-i18next';

/**
 * Safe wrapper for useTranslation hook
 * Returns original text as fallback if translation key doesn't exist
 */
export function useSafeTranslation() {
  const result = useOriginalTranslation();

  const safeT = (key: string, options?: any) => {
    try {
      const translated = result.t(key, options);
      // Se ritorna la chiave stessa, significa che la traduzione non esiste
      // In questo caso, ritorniamo la chiave come fallback
      return translated;
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
  };

  return {
    ...result,
    t: safeT,
  };
}

// Export anche come default per retrocompatibilità
export default useSafeTranslation;
