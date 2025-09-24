-- Fix Security Definer View Issue
-- Remove the security definer view and replace with secure functions

-- 1. Drop the security definer view that was flagged
DROP VIEW IF EXISTS public.admin_profiles_view;

-- 2. Create a secure function instead of the view for admin profile access
CREATE OR REPLACE FUNCTION public.get_admin_profiles_masked(
  _limit INTEGER DEFAULT 50,
  _offset INTEGER DEFAULT 0,
  _search TEXT DEFAULT NULL
) RETURNS TABLE(
  id UUID,
  nome TEXT,
  cognome TEXT,
  email TEXT,
  codice_fiscale_masked TEXT,
  provider_autenticazione TEXT,
  enabled BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  ultimo_accesso_spid TIMESTAMP WITH TIME ZONE,
  livello_autenticazione_spid TEXT,
  disabled_at TIMESTAMP WITH TIME ZONE,
  disabled_by UUID,
  disable_reason TEXT
) AS $$
BEGIN
  -- Only admins can access this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Log the admin access attempt
  PERFORM public.log_security_event(
    'admin_profiles_list_access',
    NULL,
    jsonb_build_object(
      'admin_user_id', auth.uid(),
      'search_term', _search,
      'limit', _limit,
      'offset', _offset
    ),
    'info'
  );
  
  -- Return the masked profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.cognome,
    p.email,
    public.mask_sensitive_data(p.codice_fiscale, FALSE) as codice_fiscale_masked,
    p.provider_autenticazione,
    p.enabled,
    p.created_at,
    p.updated_at,
    p.ultimo_accesso_spid,
    p.livello_autenticazione_spid,
    p.disabled_at,
    p.disabled_by,
    p.disable_reason
  FROM public.profiles p
  WHERE 
    (_search IS NULL OR 
     LOWER(p.nome || ' ' || p.cognome || ' ' || COALESCE(p.email, '')) LIKE LOWER('%' || _search || '%'))
  ORDER BY p.created_at DESC
  LIMIT _limit OFFSET _offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Create a function to get profile count for pagination
CREATE OR REPLACE FUNCTION public.get_admin_profiles_count(
  _search TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  profile_count INTEGER;
BEGIN
  -- Only admins can access this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  SELECT COUNT(*)
  INTO profile_count
  FROM public.profiles p
  WHERE 
    (_search IS NULL OR 
     LOWER(p.nome || ' ' || p.cognome || ' ' || COALESCE(p.email, '')) LIKE LOWER('%' || _search || '%'));
  
  RETURN profile_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create a function specifically for getting a single profile with masked data
CREATE OR REPLACE FUNCTION public.get_profile_masked(
  _profile_id UUID
) RETURNS TABLE(
  id UUID,
  nome TEXT,
  cognome TEXT,
  email TEXT,
  codice_fiscale_masked TEXT,
  provider_autenticazione TEXT,
  enabled BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  ultimo_accesso_spid TIMESTAMP WITH TIME ZONE,
  livello_autenticazione_spid TEXT,
  disabled_at TIMESTAMP WITH TIME ZONE,
  disabled_by UUID,
  disable_reason TEXT
) AS $$
BEGIN
  -- Allow users to see their own profile or admins to see any profile
  IF NOT (auth.uid() = _profile_id OR is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: Insufficient privileges';
  END IF;
  
  -- Log the access attempt
  PERFORM public.log_profile_access(_profile_id, 
    CASE WHEN auth.uid() = _profile_id THEN 'self_view' ELSE 'admin_view' END
  );
  
  -- Return the masked profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.cognome,
    p.email,
    CASE 
      WHEN auth.uid() = _profile_id THEN p.codice_fiscale -- Users can see their own full CF
      ELSE public.mask_sensitive_data(p.codice_fiscale, FALSE) -- Admins see masked
    END as codice_fiscale_masked,
    p.provider_autenticazione,
    p.enabled,
    p.created_at,
    p.updated_at,
    p.ultimo_accesso_spid,
    p.livello_autenticazione_spid,
    p.disabled_at,
    p.disabled_by,
    p.disable_reason
  FROM public.profiles p
  WHERE p.id = _profile_id AND p.enabled = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;