-- Crea tabella profiles se non esiste
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  cognome TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Aggiungi campi SPID alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS codice_fiscale TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS provider_autenticazione TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS livello_autenticazione_spid TEXT,
ADD COLUMN IF NOT EXISTS ultimo_accesso_spid TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dati_spid JSONB;

-- Crea indice per ricerche veloci per codice fiscale
CREATE INDEX IF NOT EXISTS idx_profiles_codice_fiscale ON public.profiles(codice_fiscale);

-- Policy per utenti di vedere il proprio profilo
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Aggiungi constraint per validare codice fiscale italiano
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_codice_fiscale 
CHECK (codice_fiscale IS NULL OR length(codice_fiscale) = 16);

-- Tabella per log accessi SPID (compliance)
CREATE TABLE IF NOT EXISTS public.spid_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  codice_fiscale TEXT NOT NULL,
  livello_autenticazione TEXT NOT NULL,
  identity_provider TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on SPID logs
ALTER TABLE public.spid_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy per admin per vedere i log SPID
CREATE POLICY "Admins can view SPID logs" ON public.spid_access_logs
FOR SELECT USING (public.is_admin(auth.uid()));

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();