# Setup Variabili d'Ambiente - IMPORTANTE

## ⚠️ AZIONE RICHIESTA

Per completare la configurazione del reset password con il nuovo URL, devi configurare le variabili d'ambiente sulle piattaforme di hosting.

---

## 1️⃣ Configurazione Vercel (per VITE_APP_URL)

### Opzione A: Tramite Dashboard (CONSIGLIATO)

1. Vai su https://vercel.com/dashboard
2. Seleziona il progetto `nai-navigatore-genova`
3. Vai in **Settings** → **Environment Variables**
4. Clicca **Add New**
5. Aggiungi:
   ```
   Name: VITE_APP_URL
   Value: https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
6. Clicca **Save**
7. Vai in **Deployments** e fai **Redeploy** dell'ultimo deployment

### Opzione B: Tramite CLI (se preferisci)

```bash
# Installa Vercel CLI (se non ce l'hai)
npm i -g vercel

# Login
vercel login

# Vai nella directory del progetto
cd /Users/alessandroborsato/Desktop/nai-navigatore-genova-main

# Link al progetto
vercel link

# Aggiungi la variabile d'ambiente
vercel env add VITE_APP_URL production
# Quando richiesto, inserisci: https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app

vercel env add VITE_APP_URL preview
# Quando richiesto, inserisci: https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app

# Redeploy
vercel --prod
```

---

## 2️⃣ Configurazione Supabase (per APP_URL nelle Functions)

### Opzione A: Tramite Dashboard (CONSIGLIATO)

1. Vai su https://supabase.com/dashboard
2. Seleziona il progetto (ID: `aksvtewwjusdmfylallx`)
3. Vai in **Project Settings** (icona ingranaggio in basso a sinistra)
4. Vai in **Edge Functions** → **Manage secrets**
5. Clicca **Add new secret**
6. Aggiungi:
   ```
   Name: APP_URL
   Value: https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app
   ```
7. Clicca **Save**
8. Le Edge Functions useranno automaticamente il nuovo valore

### Opzione B: Tramite CLI

```bash
# Login a Supabase
npx supabase login

# Aggiungi il secret
npx supabase secrets set APP_URL=https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app --project-ref aksvtewwjusdmfylallx

# Verifica
npx supabase secrets list --project-ref aksvtewwjusdmfylallx
```

---

## ✅ Verifica che Funzioni

Dopo aver configurato entrambe le variabili e fatto redeploy:

1. Vai su https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app/auth
2. Clicca "Password dimenticata?"
3. Inserisci la tua email
4. Controlla l'email ricevuta
5. Il link dovrebbe essere: `https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app/reset-password?...`
   - ❌ NON più: `https://nai-navigatore-genova-xxx.vercel.app/reset-password`
   - ✅ Deve essere: `https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app/reset-password`

---

## 📝 Stato Attuale

✅ Codice modificato e pushato su GitHub
✅ Helper `getAppUrl()` creato
✅ Auth.tsx aggiornato
✅ Supabase functions aggiornate
✅ Config.toml aggiornato
⏳ **DA FARE**: Configurare variabili d'ambiente (sopra)
⏳ **DA FARE**: Redeploy su Vercel

---

## 🔍 Debug

Se dopo la configurazione non funziona ancora:

1. **Controlla i logs di Vercel**: https://vercel.com/dashboard → Deployments → Logs
2. **Controlla i logs di Supabase**: Dashboard → Edge Functions → Logs
3. **Verifica le variabili**:
   - Vercel: Settings → Environment Variables
   - Supabase: Project Settings → Edge Functions → Secrets
4. **Console del browser**: Apri DevTools e cerca errori

---

## ❓ Comandi Rapidi

```bash
# Verifica che le modifiche siano su GitHub
git log --oneline -5

# Verifica che il file .env locale abbia VITE_APP_URL
cat .env | grep VITE_APP_URL

# Testa in locale (dopo aver aggiunto VITE_APP_URL in .env)
npm run dev
```
