-- Update RLS to allow viewing all published initiatives regardless of end_date
-- and ensure policies are permissive so users can also view their own items.

-- Drop existing SELECT policies to avoid conflicting restrictive combinations
DROP POLICY IF EXISTS "Published initiatives are viewable by everyone" ON public.initiatives;
DROP POLICY IF EXISTS "Users can view their own initiatives" ON public.initiatives;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Published initiatives are viewable by everyone"
ON public.initiatives
FOR SELECT
USING (published = true);

CREATE POLICY "Users can view their own initiatives"
ON public.initiatives
FOR SELECT
USING (auth.uid() = created_by);