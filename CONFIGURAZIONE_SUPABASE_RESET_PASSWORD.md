# Configurazione Reset Password - Supabase

## Problema Risolto

Il link di reset password faceva entrare direttamente nella piattaforma invece di portare alla pagina di reset password.

## Modifiche Apportate

### 1. AuthProvider (`src/hooks/useAuth.tsx`)
- Aggiunto gestione evento `PASSWORD_RECOVERY`
- Quando viene rilevato questo evento, l'utente NON viene autenticato automaticamente
- Permette alla pagina `/reset-password` di gestire correttamente il flusso

### 2. ResetPassword (`src/pages/ResetPassword.tsx`)
- Aggiunto delay prima del redirect per dare tempo al caricamento
- Dopo il reset della password, viene effettuato logout e redirect al login
- L'utente DEVE fare login con la nuova password (non viene autenticato automaticamente)

## Configurazione Automatica tramite GitHub

La configurazione è gestita automaticamente tramite il file `supabase/config.toml` che è collegato a GitHub.

### File Configurato: `supabase/config.toml`

Il file contiene:
- **Site URL**: `https://neiptest.linos.co` (URL principale di produzione)
- **Additional Redirect URLs**:
  - `http://localhost:5173` e `http://localhost:5173/reset-password` (sviluppo locale)
  - `https://neiptest.linos.co` e `https://neiptest.linos.co/reset-password` (produzione)
- **Configurazione Email**: Abilitata conferma email e doppia conferma per i cambiamenti

### Deployment

Quando fai push su GitHub, Supabase rileva automaticamente le modifiche al `config.toml` e applica la configurazione.

**IMPORTANTE**: Dopo il push, Supabase potrebbe impiegare qualche minuto per applicare le modifiche. Puoi verificare lo stato su:
- [Supabase Dashboard](https://supabase.com/dashboard) > Authentication > URL Configuration

## Flusso Corretto

1. Utente clicca "Password dimenticata?"
2. Inserisce email e riceve link via email
3. Cliccando sul link viene portato a `/reset-password` con i parametri nell'hash
4. Inserisce la nuova password
5. Viene fatto logout automaticamente
6. Viene reindirizzato al login
7. Deve effettuare login con la nuova password

## Debug

Se il problema persiste, controlla la console del browser per i log:
- `Auth state changed:` mostra gli eventi di autenticazione
- `Reset password params:` mostra i parametri nell'URL

Se vedi `type: null` o `accessToken: false`, significa che il link nell'email non contiene i parametri corretti. In questo caso, verifica la configurazione degli URL di redirect su Supabase.
