-- Add nai_benefits column to initiatives table
ALTER TABLE public.initiatives 
ADD COLUMN IF NOT EXISTS nai_benefits TEXT;