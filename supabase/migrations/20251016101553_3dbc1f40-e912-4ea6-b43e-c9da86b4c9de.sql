-- Rimuovi la policy problematica che causa ricorsione infinita
DROP POLICY IF EXISTS "Admins can view basic profile info" ON public.profiles;

-- La policy "Admins can access masked profile view" è sufficiente per gli admin
-- Non serve la policy con la subquery ricorsiva