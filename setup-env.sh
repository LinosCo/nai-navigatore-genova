#!/bin/bash

# Script per configurare le variabili d'ambiente su Vercel e Supabase
# Esegui questo script dopo aver fatto login su entrambe le piattaforme

set -e  # Exit on error

echo "🚀 Setup Variabili d'Ambiente per NEIP"
echo "======================================"
echo ""

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variabili
APP_URL="https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app"
SUPABASE_PROJECT_REF="aksvtewwjusdmfylallx"

echo -e "${YELLOW}📋 Variabili da configurare:${NC}"
echo "  - VITE_APP_URL: $APP_URL (Vercel)"
echo "  - APP_URL: $APP_URL (Supabase Functions)"
echo ""

# ====================================
# 1. CONFIGURAZIONE SUPABASE
# ====================================

echo -e "${YELLOW}1️⃣  Configurazione Supabase...${NC}"

# Verifica se supabase CLI è disponibile
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI non trovato. Installandolo via npx..."
    USE_NPX=true
else
    USE_NPX=false
fi

# Funzione per eseguire comandi supabase
run_supabase() {
    if [ "$USE_NPX" = true ]; then
        npx supabase "$@"
    else
        supabase "$@"
    fi
}

# Verifica login
echo "   Verifico login Supabase..."
if ! run_supabase projects list &> /dev/null; then
    echo -e "${YELLOW}   Non sei loggato. Avvio login...${NC}"
    echo ""
    echo "   Segui le istruzioni per fare login a Supabase:"
    run_supabase login
    echo ""
fi

# Configura secret
echo "   Configurazione APP_URL su Supabase Functions..."
if run_supabase secrets set "APP_URL=$APP_URL" --project-ref "$SUPABASE_PROJECT_REF"; then
    echo -e "${GREEN}   ✅ APP_URL configurato su Supabase${NC}"
else
    echo -e "${RED}   ❌ Errore nella configurazione Supabase${NC}"
    echo "   Puoi configurarlo manualmente su:"
    echo "   https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/settings/functions"
fi

echo ""

# ====================================
# 2. CONFIGURAZIONE VERCEL
# ====================================

echo -e "${YELLOW}2️⃣  Configurazione Vercel...${NC}"

# Verifica se vercel CLI è disponibile
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI non trovato globalmente."
    echo "   Puoi installarlo con: npm i -g vercel"
    echo ""
    echo "   Oppure configurare manualmente su:"
    echo "   https://vercel.com/dashboard → Settings → Environment Variables"
    echo ""
    echo "   Aggiungi:"
    echo "   Name: VITE_APP_URL"
    echo "   Value: $APP_URL"
    echo "   Environments: Production, Preview, Development"
    echo ""
    SKIP_VERCEL=true
else
    SKIP_VERCEL=false
fi

if [ "$SKIP_VERCEL" = false ]; then
    # Verifica se siamo in un progetto Vercel
    if [ ! -d ".vercel" ]; then
        echo "   Collegamento al progetto Vercel..."
        vercel link
    fi

    # Configura variabile d'ambiente
    echo "   Configurazione VITE_APP_URL su Vercel..."

    echo "   → Production environment"
    if echo "$APP_URL" | vercel env add VITE_APP_URL production 2>&1 | grep -q "already exists"; then
        echo "     (già esistente, updating...)"
        vercel env rm VITE_APP_URL production -y 2>/dev/null || true
        echo "$APP_URL" | vercel env add VITE_APP_URL production
    fi

    echo "   → Preview environment"
    if echo "$APP_URL" | vercel env add VITE_APP_URL preview 2>&1 | grep -q "already exists"; then
        echo "     (già esistente, updating...)"
        vercel env rm VITE_APP_URL preview -y 2>/dev/null || true
        echo "$APP_URL" | vercel env add VITE_APP_URL preview
    fi

    echo -e "${GREEN}   ✅ VITE_APP_URL configurato su Vercel${NC}"

    # Chiedi se fare redeploy
    echo ""
    read -p "   Vuoi fare redeploy ora? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   Facendo redeploy..."
        vercel --prod
        echo -e "${GREEN}   ✅ Redeploy completato${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Ricordati di fare redeploy manualmente:${NC}"
        echo "      vercel --prod"
    fi
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ Setup completato!${NC}"
echo ""
echo "📝 Verifica che tutto funzioni:"
echo "   1. Vai su $APP_URL/auth"
echo "   2. Clicca 'Password dimenticata?'"
echo "   3. Inserisci email e controlla il link ricevuto"
echo "   4. Dovrebbe puntare a $APP_URL/reset-password"
echo ""
echo "🔍 Se qualcosa non funziona, controlla:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Supabase Dashboard: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF"
echo ""
