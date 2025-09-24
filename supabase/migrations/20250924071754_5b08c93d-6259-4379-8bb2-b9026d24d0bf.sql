-- Assegna ruolo admin all'utente nicolazago@gmail.com
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Trova l'utente per email
  SELECT id INTO target_user_id 
  FROM public.profiles 
  WHERE email = 'nicolazago@gmail.com';
  
  -- Verifica che l'utente esista
  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Utente con email nicolazago@gmail.com non trovato';
  ELSE
    -- Rimuovi eventuali ruoli esistenti per questo utente
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Assegna ruolo admin
    INSERT INTO public.user_roles (
      user_id,
      role
    ) VALUES (
      target_user_id,
      'admin'
    );
    
    -- Assicurati che l'utente sia abilitato
    UPDATE public.profiles 
    SET 
      enabled = true,
      disabled_at = NULL,
      disabled_by = NULL,
      disable_reason = NULL,
      updated_at = NOW()
    WHERE id = target_user_id;
    
    RAISE NOTICE 'Ruolo admin assegnato con successo all''utente nicolazago@gmail.com';
  END IF;
END $$;