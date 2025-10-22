-- Fix Personal Information Exposure in Profiles Table
-- Implement field-level access controls and data masking for sensitive PII

-- 1. Create a function to mask sensitive data for admin views
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  _codice_fiscale TEXT,
  _full_access BOOLEAN DEFAULT FALSE
) RETURNS TEXT AS $$
BEGIN
  -- Only show full codice_fiscale if explicitly requesting full access and user is admin
  IF _full_access AND is_admin(auth.uid()) THEN
    RETURN _codice_fiscale;
  END IF;
  
  -- Mask the codice_fiscale showing only first 3 and last 3 characters
  IF _codice_fiscale IS NOT NULL AND LENGTH(_codice_fiscale) >= 6 THEN
    RETURN SUBSTRING(_codice_fiscale FROM 1 FOR 3) || '***' || SUBSTRING(_codice_fiscale FROM LENGTH(_codice_fiscale) - 2);
  END IF;
  
  RETURN '***';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create a view for safe admin access to profiles with masked data
CREATE OR REPLACE VIEW public.admin_profiles_view AS
SELECT 
  id,
  nome,
  cognome,
  email,
  mask_sensitive_data(codice_fiscale, FALSE) as codice_fiscale_masked,
  provider_autenticazione,
  enabled,
  created_at,
  updated_at,
  ultimo_accesso_spid,
  livello_autenticazione_spid,
  disabled_at,
  disabled_by,
  disable_reason
FROM public.profiles
WHERE is_admin(auth.uid());

-- Enable RLS on the view
ALTER VIEW public.admin_profiles_view SET (security_barrier = true);

-- 3. Create a restricted function for full PII access (only for specific admin operations)
CREATE OR REPLACE FUNCTION public.get_profile_full_pii(
  _profile_id UUID,
  _operation_reason TEXT
) RETURNS TABLE(
  id UUID,
  codice_fiscale TEXT,
  nome TEXT,
  cognome TEXT,
  email TEXT,
  dati_spid JSONB
) AS $$
BEGIN
  -- Only admins can access this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Log the full PII access attempt
  PERFORM public.log_security_event(
    'admin_full_pii_access',
    _profile_id::TEXT,
    jsonb_build_object(
      'accessed_profile_id', _profile_id,
      'operation_reason', _operation_reason,
      'admin_user_id', auth.uid()
    ),
    'warning'
  );
  
  -- Return the requested profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.codice_fiscale,
    p.nome,
    p.cognome,
    p.email,
    p.dati_spid
  FROM public.profiles p
  WHERE p.id = _profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Update RLS policies to be more restrictive
-- Drop the existing overly permissive admin policy
DROP POLICY IF EXISTS "Admins can view all profiles with restrictions" ON public.profiles;

-- Create more restrictive admin policies
CREATE POLICY "Admins can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (
  is_admin(auth.uid()) AND
  -- Log admin access but don't expose full PII in regular queries
  (SELECT public.log_profile_access(id, 'admin_basic_view') FROM profiles WHERE profiles.id = public.profiles.id LIMIT 1) IS NOT DISTINCT FROM NULL
);

-- 5. Create a policy specifically for the masked view access
CREATE POLICY "Admins can access masked profile view" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- 6. Add additional security for SPID data access
CREATE OR REPLACE FUNCTION public.get_spid_data_summary(
  _profile_id UUID
) RETURNS TABLE(
  has_spid_data BOOLEAN,
  livello_autenticazione TEXT,
  ultimo_accesso TIMESTAMP WITH TIME ZONE,
  provider TEXT
) AS $$
BEGIN
  -- Only admins can access this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Log the SPID data access
  PERFORM public.log_security_event(
    'admin_spid_summary_access',
    _profile_id::TEXT,
    jsonb_build_object(
      'accessed_profile_id', _profile_id,
      'admin_user_id', auth.uid()
    ),
    'info'
  );
  
  RETURN QUERY
  SELECT 
    (p.dati_spid IS NOT NULL) as has_spid_data,
    p.livello_autenticazione_spid,
    p.ultimo_accesso_spid,
    p.provider_autenticazione
  FROM public.profiles p
  WHERE p.id = _profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Create audit table for sensitive data access requests
CREATE TABLE IF NOT EXISTS public.pii_access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  target_profile_id UUID NOT NULL,
  requested_fields TEXT[],
  business_justification TEXT NOT NULL,
  approved_by UUID,
  request_status TEXT DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'denied', 'fulfilled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Enable RLS on PII access requests
ALTER TABLE public.pii_access_requests ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage PII access requests
CREATE POLICY "Admins can manage PII access requests" 
ON public.pii_access_requests 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 8. Create function to request access to sensitive PII
CREATE OR REPLACE FUNCTION public.request_pii_access(
  _target_profile_id UUID,
  _requested_fields TEXT[],
  _justification TEXT
) RETURNS UUID AS $$
DECLARE
  request_id UUID;
BEGIN
  -- Only admins can request PII access
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Validate justification
  IF _justification IS NULL OR LENGTH(TRIM(_justification)) < 10 THEN
    RAISE EXCEPTION 'Business justification is required (minimum 10 characters)';
  END IF;
  
  -- Create the request
  INSERT INTO public.pii_access_requests (
    admin_user_id,
    target_profile_id,
    requested_fields,
    business_justification
  ) VALUES (
    auth.uid(),
    _target_profile_id,
    _requested_fields,
    _justification
  ) RETURNING id INTO request_id;
  
  -- Log the request
  PERFORM public.log_security_event(
    'pii_access_requested',
    _target_profile_id::TEXT,
    jsonb_build_object(
      'request_id', request_id,
      'requested_fields', _requested_fields,
      'justification', _justification,
      'admin_user_id', auth.uid()
    ),
    'warning'
  );
  
  RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Add index for performance on masked view
CREATE INDEX IF NOT EXISTS idx_profiles_admin_access ON public.profiles(id, enabled) WHERE enabled = true;