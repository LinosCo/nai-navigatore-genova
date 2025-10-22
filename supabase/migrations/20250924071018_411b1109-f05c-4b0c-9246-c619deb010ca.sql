-- Aggiungi campo enabled alla tabella profiles per abilitare/disabilitare utenti
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS disabled_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS disable_reason TEXT;

-- Crea index per query veloci su utenti abilitati
CREATE INDEX IF NOT EXISTS idx_profiles_enabled ON public.profiles(enabled);

-- Aggiorna policy per permettere agli admin di vedere tutti i profili
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.is_admin(auth.uid()));

-- Aggiorna policy per permettere agli admin di modificare tutti i profili
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (public.is_admin(auth.uid()));

-- Aggiorna policy per utenti normali - solo se abilitati
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id AND enabled = true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id AND enabled = true);

-- Funzione per disabilitare un utente (solo admin)
CREATE OR REPLACE FUNCTION public.disable_user(_user_id uuid, _reason text DEFAULT 'Disabilitato da admin')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifica che chi chiama sia admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accesso negato: solo gli admin possono disabilitare utenti';
  END IF;
  
  -- Aggiorna il profilo
  UPDATE public.profiles 
  SET 
    enabled = false,
    disabled_at = NOW(),
    disabled_by = auth.uid(),
    disable_reason = _reason,
    updated_at = NOW()
  WHERE id = _user_id;
  
  RETURN FOUND;
END;
$$;

-- Funzione per abilitare un utente (solo admin)
CREATE OR REPLACE FUNCTION public.enable_user(_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifica che chi chiama sia admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accesso negato: solo gli admin possono abilitare utenti';
  END IF;
  
  -- Aggiorna il profilo
  UPDATE public.profiles 
  SET 
    enabled = true,
    disabled_at = NULL,
    disabled_by = NULL,
    disable_reason = NULL,
    updated_at = NOW()
  WHERE id = _user_id;
  
  RETURN FOUND;
END;
$$;

-- Log delle azioni admin
CREATE TABLE IF NOT EXISTS public.admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id),
  target_user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin actions log
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;

-- Policy per admin per vedere i log
CREATE POLICY "Admins can view admin actions log" ON public.admin_actions_log
FOR SELECT USING (public.is_admin(auth.uid()));

-- Policy per admin per inserire nei log
CREATE POLICY "Admins can insert admin actions log" ON public.admin_actions_log
FOR INSERT WITH CHECK (public.is_admin(auth.uid()) AND admin_user_id = auth.uid());