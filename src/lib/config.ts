/**
 * Configurazione dell'applicazione
 * Centralizza le variabili d'ambiente e le configurazioni
 */

/**
 * Ottiene l'URL base dell'applicazione
 * In produzione usa la variabile d'ambiente VITE_APP_URL
 * In sviluppo usa window.location.origin o fallback a localhost
 */
export const getAppUrl = (): string => {
  // In produzione, usa sempre la variabile d'ambiente
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }

  // In sviluppo, usa l'origin corrente
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback
  return 'http://localhost:5173';
};

export const APP_CONFIG = {
  appUrl: getAppUrl(),
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
} as const;
