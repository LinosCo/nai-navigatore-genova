-- Rimuovi il ruolo duplicato "moderator" per nicolazago@gmail.com
DELETE FROM public.user_roles 
WHERE user_id = '06a5a579-dff4-48be-b490-6cc05748492a' 
AND role = 'moderator';