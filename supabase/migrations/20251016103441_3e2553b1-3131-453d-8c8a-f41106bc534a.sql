-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enable_all_notifications BOOLEAN NOT NULL DEFAULT true,
  enabled_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  enable_email_notifications BOOLEAN NOT NULL DEFAULT false,
  notification_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  initiative_id UUID REFERENCES public.initiatives(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'new_initiative',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create notifications when a new initiative is published
CREATE OR REPLACE FUNCTION public.notify_users_new_initiative()
RETURNS TRIGGER AS $$
DECLARE
  pref RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  IF NEW.published = true AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.published = false)) THEN
    notification_title := 'Nuova iniziativa: ' || NEW.title;
    notification_message := 'È stata pubblicata una nuova iniziativa in ' || NEW.location;
    
    FOR pref IN 
      SELECT np.user_id, np.enable_all_notifications, np.enabled_categories
      FROM public.notification_preferences np
      WHERE np.user_id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000'::uuid)
    LOOP
      IF pref.enable_all_notifications = true OR 
         (pref.enabled_categories IS NOT NULL AND NEW.type = ANY(pref.enabled_categories)) THEN
        
        INSERT INTO public.notifications (user_id, initiative_id, type, title, message)
        VALUES (pref.user_id, NEW.id, 'new_initiative', notification_title, notification_message);
        
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new initiatives
CREATE TRIGGER on_initiative_published
  AFTER INSERT OR UPDATE ON public.initiatives
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_new_initiative();

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_id_param UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.notifications
  WHERE user_id = user_id_param AND read = false;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Trigger to update updated_at on notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);