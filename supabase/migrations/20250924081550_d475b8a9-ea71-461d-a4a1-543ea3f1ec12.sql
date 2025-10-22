-- Prima verifichiamo se l'utente esiste in auth.users
DO $$
DECLARE
  target_user_id UUID;
  user_email TEXT := 'nicolazago@gmail.com';
BEGIN
  -- Trova l'utente per email dalla tabella auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  -- Verifica che l'utente esista
  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Utente con email % non trovato in auth.users', user_email;
  ELSE
    RAISE NOTICE 'Utente trovato con ID: %', target_user_id;
    
    -- Crea il profilo se non esiste
    INSERT INTO public.profiles (
      id,
      email,
      enabled,
      created_at,
      updated_at
    ) VALUES (
      target_user_id,
      user_email,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      enabled = true,
      disabled_at = NULL,
      disabled_by = NULL,
      disable_reason = NULL,
      updated_at = NOW();
    
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
    
    RAISE NOTICE 'Profilo creato e ruolo admin assegnato con successo all''utente %', user_email;
  END IF;
END $$;