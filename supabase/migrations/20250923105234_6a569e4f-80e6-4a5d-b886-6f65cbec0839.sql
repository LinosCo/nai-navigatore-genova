-- Update all demo initiatives to be published
UPDATE initiatives 
SET published = true 
WHERE is_generated = true;