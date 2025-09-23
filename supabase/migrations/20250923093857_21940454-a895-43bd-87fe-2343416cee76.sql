-- Add end_date field to initiatives table
ALTER TABLE public.initiatives 
ADD COLUMN end_date timestamp with time zone;

-- Update the RLS policy for viewing initiatives to exclude expired ones for non-owners
DROP POLICY IF EXISTS "Initiatives are viewable by everyone" ON public.initiatives;

CREATE POLICY "Published initiatives are viewable by everyone" 
ON public.initiatives 
FOR SELECT 
USING (
  published = true 
  AND (end_date IS NULL OR end_date > now() OR created_by = auth.uid())
);

CREATE POLICY "Users can view their own initiatives" 
ON public.initiatives 
FOR SELECT 
USING (created_by = auth.uid());