-- Add INSERT policy for notifications table to prevent fake notifications
-- Only allow system/service role to insert notifications (via triggers and edge functions)
CREATE POLICY "Only system can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (false);

-- Note: SECURITY DEFINER functions (like triggers) can bypass RLS policies,
-- so the notify_users_new_initiative trigger will continue to work correctly