-- Create table for storing educational initiatives
CREATE TABLE public.initiatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  participants TEXT NOT NULL,
  contact TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('l2', 'cultura', 'social', 'sport')),
  organization TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_generated BOOLEAN DEFAULT false,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;

-- Create policies for initiatives
CREATE POLICY "Initiatives are viewable by everyone" 
ON public.initiatives 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own initiatives" 
ON public.initiatives 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own initiatives" 
ON public.initiatives 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own initiatives" 
ON public.initiatives 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_initiatives_updated_at
BEFORE UPDATE ON public.initiatives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();