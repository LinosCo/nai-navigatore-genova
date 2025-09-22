-- Rimuovi tutte le iniziative generate automaticamente (contenuti demo)
DELETE FROM initiatives WHERE is_generated = true OR title LIKE '%Generata%' OR title LIKE '%Demo%';