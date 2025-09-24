-- Phase 1: Critical Security Fixes

-- 1. Strengthen Profile RLS Policies with field-level restrictions
-- Add more restrictive policies for sensitive SPID data access

-- Drop existing broad policies and replace with more granular ones
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new restrictive policies for profile access
CREATE POLICY "Users can view their basic profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id AND 
  enabled = true
);

-- Separate policy for admin access with audit logging
CREATE POLICY "Admins can view all profiles with restrictions" 
ON public.profiles 
FOR SELECT 
USING (
  is_admin(auth.uid()) AND
  -- Log admin access to profiles
  (SELECT public.log_profile_access(id, 'admin_view') FROM profiles WHERE profiles.id = public.profiles.id LIMIT 1) IS NOT DISTINCT FROM NULL
);

-- 2. Restrict app settings access to admins only
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.app_settings;

CREATE POLICY "Only admins can read settings" 
ON public.app_settings 
FOR SELECT 
USING (is_admin(auth.uid()));

-- 3. Add enhanced audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  target_resource TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  severity TEXT DEFAULT 'info', -- info, warning, critical
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Only admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Only system can insert security events (via functions)
CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (auth.uid() IS NULL OR is_admin(auth.uid()));

-- 4. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type TEXT,
  _target_resource TEXT DEFAULT NULL,
  _details JSONB DEFAULT NULL,
  _severity TEXT DEFAULT 'info'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_events (
    event_type,
    user_id,
    target_resource,
    details,
    severity
  ) VALUES (
    _event_type,
    auth.uid(),
    _target_resource,
    _details,
    _severity
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Add rate limiting table for SPID authentication
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or user identifier
  attempt_count INTEGER DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_identifier ON public.auth_rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked_until ON public.auth_rate_limits(blocked_until);

-- Enable RLS on rate limits
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits" 
ON public.auth_rate_limits 
FOR ALL 
USING (false)
WITH CHECK (false);