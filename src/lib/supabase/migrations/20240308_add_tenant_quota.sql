ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS tenant_quota integer DEFAULT 200;
