-- Fix security issue: Restrict app_settings read access to authenticated users only
-- Remove the overly permissive "Anyone can read settings" policy
DROP POLICY "Anyone can read settings" ON public.app_settings;

-- Create a new policy that only allows authenticated users to read settings
CREATE POLICY "Authenticated users can read settings" 
ON public.app_settings 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the admin-only modification policy as is (already secure)
-- Policy "Only admins can modify settings" remains unchanged