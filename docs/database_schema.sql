-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------
-- 1. Profiles (Supabase Auth Sync)
--------------------------------------------------

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'staff'
        CHECK (role IN ('super_admin','admin','staff')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', 'staff');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

--------------------------------------------------
-- 3. Events
--------------------------------------------------

CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT DEFAULT 'internal'
        CHECK (event_type IN ('internal','public')),
    name TEXT NOT NULL,
    event_date DATE NOT NULL,
    location TEXT,
    dress_code TEXT,
    logo_url TEXT,
    wa_template TEXT,
    external_quota INTEGER DEFAULT 1000,
    tenant_quota INTEGER DEFAULT 200,
    public_reg_status TEXT DEFAULT 'closed'
        CHECK (public_reg_status IN ('open','closed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

--------------------------------------------------
-- 4. Event Permissions
--------------------------------------------------

CREATE TABLE public.event_permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  role text CHECK (role IN ('manager','scanner')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id,event_id)
);

CREATE INDEX idx_event_permissions_user_id
ON public.event_permissions(user_id);

CREATE INDEX idx_event_permissions_event_id
ON public.event_permissions(event_id);

--------------------------------------------------
-- 5. Guests
--------------------------------------------------

CREATE TABLE public.guests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_type text
      CHECK (guest_type IN ('internal','external','tenant')),
  registration_source text DEFAULT 'admin_invite'
      CHECK (registration_source IN ('admin_invite','public_registration')),
  full_name text NOT NULL,
  phone text UNIQUE,
  email text,
  address text,
  metadata jsonb DEFAULT '{}'::jsonb,
  rsvp_status text DEFAULT 'pending'
      CHECK (rsvp_status IN ('pending','confirmed','declined')),
  invitation_code text UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_guests_phone
ON public.guests(phone);

--------------------------------------------------
-- 6. Guest Events (Many-to-Many)
--------------------------------------------------

CREATE TABLE public.guest_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id uuid NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (guest_id,event_id)
);

CREATE INDEX idx_guest_events_guest
ON public.guest_events(guest_id);

CREATE INDEX idx_guest_events_event
ON public.guest_events(event_id);

--------------------------------------------------
-- 7. Event Guest Rules (Jam masuk tiap tipe tamu)
--------------------------------------------------

CREATE TABLE public.event_guest_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  event_id uuid NOT NULL
    REFERENCES public.events(id) ON DELETE CASCADE,

  guest_type text NOT NULL
    CHECK (guest_type IN ('internal','external','tenant')),

  open_gate TIME,
  close_gate TIME,
  start_time TIME,

  created_at timestamptz DEFAULT now(),

  UNIQUE(event_id, guest_type)
);

CREATE INDEX idx_event_guest_rules_event
ON public.event_guest_rules(event_id);

--------------------------------------------------
-- 8. Checkins (2 barcode scans)
--------------------------------------------------

CREATE TABLE public.checkins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  guest_id uuid NOT NULL
    REFERENCES public.guests(id) ON DELETE CASCADE,

  event_id uuid NOT NULL
    REFERENCES public.events(id) ON DELETE CASCADE,

  step text NOT NULL
      CHECK (step IN ('exchange','entrance')),

  checkin_time timestamptz DEFAULT now(),

  checkin_by uuid
      REFERENCES public.profiles(id),

  CONSTRAINT checkins_unique_attendance
  UNIQUE (guest_id,event_id,step)
);

CREATE INDEX idx_checkins_event_guest
ON public.checkins(event_id,guest_id);

--------------------------------------------------
-- 9. ROW LEVEL SECURITY
--------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_guest_rules ENABLE ROW LEVEL SECURITY;

--------------------------------------------------
-- Helper: Super Admin
--------------------------------------------------

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------
-- Helper: Event Access
--------------------------------------------------

CREATE OR REPLACE FUNCTION has_event_access(event_id UUID, required_role TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN

  IF is_super_admin() THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM event_permissions
    WHERE user_id = auth.uid()
    AND event_permissions.event_id = has_event_access.event_id
    AND (required_role IS NULL OR role = required_role)
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------
-- POLICIES
--------------------------------------------------

CREATE POLICY "Super Admins manage profiles"
ON public.profiles
FOR ALL
USING (is_super_admin());

CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

--------------------------------------------------

CREATE POLICY "Public view events"
ON public.events
FOR SELECT
USING (true);

CREATE POLICY "Managers manage events"
ON public.events
FOR ALL
USING (has_event_access(id,'manager'));

CREATE POLICY "Scanners view events"
ON public.events
FOR SELECT
USING (has_event_access(id));

--------------------------------------------------

CREATE POLICY "Staff read guests"
ON public.guests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM guest_events
    WHERE guest_events.guest_id = guests.id
    AND has_event_access(guest_events.event_id)
  )
);

CREATE POLICY "Managers manage guests"
ON public.guests
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM guest_events
    WHERE guest_events.guest_id = guests.id
    AND has_event_access(guest_events.event_id,'manager')
  )
);

--------------------------------------------------

CREATE POLICY "Staff view checkins"
ON public.checkins
FOR SELECT
USING (has_event_access(event_id));

CREATE POLICY "Staff insert checkins"
ON public.checkins
FOR INSERT
WITH CHECK (has_event_access(event_id));

CREATE INDEX idx_guests_invitation_code
ON public.guests(invitation_code);

CREATE INDEX idx_checkins_guest
ON public.checkins(guest_id);

CREATE POLICY "Staff view guest rules"
ON public.event_guest_rules
FOR SELECT
USING (has_event_access(event_id));