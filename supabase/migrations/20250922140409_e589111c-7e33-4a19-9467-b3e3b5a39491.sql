-- Add published field to initiatives table
ALTER TABLE public.initiatives 
ADD COLUMN published boolean NOT NULL DEFAULT true;