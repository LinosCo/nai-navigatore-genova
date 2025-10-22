-- Add coordinates columns to initiatives table
ALTER TABLE public.initiatives 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;