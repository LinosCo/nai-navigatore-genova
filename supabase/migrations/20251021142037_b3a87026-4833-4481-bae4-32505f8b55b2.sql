-- Funzione per eliminare un utente (solo admin)
CREATE OR REPLACE FUNCTION public.delete_user(_user_id uuid, _reason text DEFAULT 'Eliminato da admin'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verifica che chi chiama sia admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accesso negato: solo gli admin possono eliminare utenti';
  END IF;
  
  -- Non permettere agli admin di eliminare se stessi
  IF auth.uid() = _user_id THEN
    RAISE EXCEPTION 'Non puoi eliminare il tuo stesso account';
  END IF;
  
  -- Log dell'azione prima dell'eliminazione
  INSERT INTO public.admin_actions_log (admin_user_id, action, target_user_id, details)
  VALUES (
    auth.uid(),
    'delete_user',
    _user_id,
    jsonb_build_object('reason', _reason, 'timestamp', NOW())
  );
  
  -- Elimina l'utente dalla tabella auth (cascade eliminerà anche il profilo)
  DELETE FROM auth.users WHERE id = _user_id;
  
  RETURN FOUND;
END;
$$;