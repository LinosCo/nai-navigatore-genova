-- Fix foreign key constraint to allow user deletion while preserving admin logs
ALTER TABLE public.admin_actions_log
DROP CONSTRAINT IF EXISTS admin_actions_log_target_user_id_fkey;

ALTER TABLE public.admin_actions_log
ADD CONSTRAINT admin_actions_log_target_user_id_fkey
FOREIGN KEY (target_user_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;