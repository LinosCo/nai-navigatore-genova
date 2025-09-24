-- Enhanced security measures for profiles table

-- 1. Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.profile_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_profile_id UUID NOT NULL,
  accessor_user_id UUID,
  access_type TEXT NOT NULL, -- 'view', 'update', 'admin_access'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.profile_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view profile access logs" 
ON public.profile_access_log 
FOR SELECT 
USING (is_admin(auth.uid()));

-- 2. Create function to log profile access
CREATE OR REPLACE FUNCTION public.log_profile_access(
  _profile_id UUID,
  _access_type TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profile_access_log (
    accessed_profile_id,
    accessor_user_id,
    access_type
  ) VALUES (
    _profile_id,
    auth.uid(),
    _access_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Create view for safe profile data (without sensitive SPID data)
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  nome,
  cognome,
  email,
  created_at,
  updated_at,
  enabled,
  provider_autenticazione
FROM public.profiles
WHERE enabled = true;

-- 4. Create secure function for profile updates that logs changes
CREATE OR REPLACE FUNCTION public.secure_update_profile(
  _profile_id UUID,
  _nome TEXT DEFAULT NULL,
  _cognome TEXT DEFAULT NULL,
  _email TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Check authorization
  IF auth.uid() != _profile_id AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot update profile';
  END IF;
  
  -- Log the update attempt
  PERFORM public.log_profile_access(_profile_id, 'update');
  
  -- Perform update only for allowed fields
  UPDATE public.profiles 
  SET 
    nome = COALESCE(_nome, nome),
    cognome = COALESCE(_cognome, cognome),
    email = COALESCE(_email, email),
    updated_at = NOW()
  WHERE id = _profile_id AND enabled = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;