-- Fix security warnings

-- 1. Fix the SECURITY DEFINER view issue by removing the view and using RLS policies instead
DROP VIEW IF EXISTS public.safe_profiles;

-- The existing RLS policies on profiles table are sufficient for security
-- No need for a separate view that bypasses user context

-- 2. Ensure all profile access functions are properly secured
-- Update the log_profile_access function to be more restrictive
CREATE OR REPLACE FUNCTION public.log_profile_access(
  _profile_id UUID,
  _access_type TEXT
) RETURNS VOID AS $$
BEGIN
  -- Only allow logging if user has access to the profile
  IF NOT (auth.uid() = _profile_id OR is_admin(auth.uid())) THEN
    RETURN; -- Silently fail for unauthorized access attempts
  END IF;
  
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

-- 3. Add policy to prevent unauthorized insertions to audit log
CREATE POLICY "Prevent unauthorized audit log insertions" 
ON public.profile_access_log 
FOR INSERT 
WITH CHECK (
  -- Only allow if accessing own profile or user is admin
  (accessor_user_id = auth.uid()) AND
  (accessed_profile_id = auth.uid() OR is_admin(auth.uid()))
);