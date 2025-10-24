# 🔐 Configurazione Reset Password - Guida Completa

## ✅ Cosa è Stato Fatto

Ho modificato il codice per risolvere il problema del reset password:

1. ✅ **AuthProvider** (`src/hooks/useAuth.tsx`) - Intercetta evento PASSWORD_RECOVERY
2. ✅ **ResetPassword** (`src/pages/ResetPassword.tsx`) - Logout dopo reset e redirect a login
3. ✅ **Config Helper** (`src/lib/config.ts`) - Centralizza gestione URL app
4. ✅ **Auth.tsx** - Usa `getAppUrl()` per tutti i redirect
5. ✅ **Supabase Functions** - Aggiornate per usare APP_URL
6. ✅ **Config.toml** - Configurati redirect URLs autorizzati
7. ✅ **Tutto pushato su GitHub** ✅

## ⚠️ ULTIMO PASSO NECESSARIO

Per far funzionare tutto, devi configurare le variabili d'ambiente. Hai **3 opzioni**:

---

### 🎯 OPZIONE 1: Script Automatico (CONSIGLIATO)

Esegui questo comando da un terminale:

```bash
./setup-env.sh
```

Lo script farà:
- Login automatico su Supabase e Vercel
- Configurazione automatica di tutte le variabili
- Redeploy automatico

**Requisiti**: Devi avere accesso alle dashboard di Supabase e Vercel

---

### 🖱️ OPZIONE 2: Configurazione Manuale Dashboard

#### A) Supabase

1. Vai su https://supabase.com/dashboard
2. Seleziona progetto ID: `aksvtewwjusdmfylallx`
3. **Project Settings** → **Edge Functions** → **Manage secrets**
4. Aggiungi secret:
   - Name: `APP_URL`
   - Value: `https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app`
5. Salva

#### B) Vercel

1. Vai su https://vercel.com/dashboard
2. Seleziona il progetto
3. **Settings** → **Environment Variables**
4. Aggiungi variabile:
   - Name: `VITE_APP_URL`
   - Value: `https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app`
   - Environments: ✅ Production ✅ Preview ✅ Development
5. Salva
6. **Deployments** → Redeploy l'ultimo deployment

---

### 💻 OPZIONE 3: CLI Commands

```bash
# Supabase
npx supabase login
npx supabase secrets set APP_URL=https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app --project-ref aksvtewwjusdmfylallx

# Vercel (installa prima: npm i -g vercel)
vercel login
cd /Users/alessandroborsato/Desktop/nai-navigatore-genova-main
vercel link
echo "https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app" | vercel env add VITE_APP_URL production
echo "https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app" | vercel env add VITE_APP_URL preview
vercel --prod
```

---

## ✅ Verifica Funzionamento

Dopo aver configurato le variabili:

1. Vai su **https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app/auth**
2. Clicca **"Password dimenticata?"**
3. Inserisci email
4. Ricevi email con link
5. **Il link DEVE essere**: `https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app/reset-password?...`
   - ❌ **NON**: `https://nai-navigatore-genova-xxx.vercel.app/...`
   - ✅ **OK**: `https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app/reset-password...`
6. Clicca sul link
7. Inserisci nuova password
8. Vieni reindirizzato al login
9. Fai login con la nuova password

---

## 📁 File Creati/Modificati

| File | Cosa fa |
|------|---------|
| `src/lib/config.ts` | Helper per gestire URL app |
| `src/hooks/useAuth.tsx` | Intercetta PASSWORD_RECOVERY |
| `src/pages/Auth.tsx` | Usa getAppUrl() |
| `src/pages/ResetPassword.tsx` | Logout dopo reset |
| `supabase/config.toml` | Redirect URLs autorizzati |
| `supabase/functions/send-daily-digest/index.ts` | Usa APP_URL |
| `supabase/functions/send-event-reminders/index.ts` | Usa APP_URL |
| `.env` | Aggiunto VITE_APP_URL locale |
| `.env.example` | Template variabili |
| `setup-env.sh` | Script automatico setup |
| `SETUP_VARIABLES.md` | Guida dettagliata |
| `CONFIGURAZIONE_SUPABASE_RESET_PASSWORD.md` | Documentazione tecnica |

---

## 🐛 Troubleshooting

### Il link nell'email punta ancora a vercel.app

- ✅ Verifica che `VITE_APP_URL` sia configurato su Vercel
- ✅ Hai fatto redeploy dopo aver aggiunto la variabile?
- ✅ Controlla che la variabile sia in tutti gli environments (Production, Preview, Development)

### La pagina di reset non carica

- ✅ Verifica che i redirect URLs siano configurati in `supabase/config.toml` (già fatto)
- ✅ Controlla che Supabase abbia applicato le modifiche dal GitHub
- ✅ Aspetta 2-3 minuti dopo il push per permettere a Supabase di sincronizzarsi

### Mi fa ancora login automatico invece di portarmi al reset

- ✅ Pulisci cache del browser
- ✅ Prova in incognito
- ✅ Verifica che il codice sia stato deployato (controlla il commit su Vercel)

---

## 📞 Comandi Utili

```bash
# Verifica variabili locali
cat .env

# Verifica ultimo commit
git log --oneline -1

# Testa in locale (deve avere VITE_APP_URL in .env)
npm run dev

# Verifica secrets Supabase
npx supabase secrets list --project-ref aksvtewwjusdmfylallx

# Verifica variabili Vercel
vercel env ls
```

---

## 🎯 Riepilogo Flusso Corretto

```
1. Utente clicca "Password dimenticata?"
   ↓
2. Inserisce email
   ↓
3. Riceve email con link a https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app/reset-password
   ↓
4. Clicca link → arriva a pagina reset (NON login automatico)
   ↓
5. Inserisce nuova password
   ↓
6. Sistema fa logout automatico
   ↓
7. Redirect a /auth (login)
   ↓
8. Utente fa login con nuova password
   ↓
9. ✅ Accesso completato
```

---

## 🚀 Quick Start

La via più veloce:

```bash
# Esegui script automatico
./setup-env.sh

# Oppure configura manualmente le 2 variabili:
# 1. VITE_APP_URL su Vercel → https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app
# 2. APP_URL su Supabase → https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app

# Poi redeploy e testa!
```

---

✨ **Tutto il codice è pronto e pushato su GitHub!**
🔧 **Basta solo configurare le 2 variabili d'ambiente**
🎉 **Dopo il setup, tutto funzionerà perfettamente!**
