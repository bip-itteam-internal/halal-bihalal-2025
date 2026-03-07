-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('super_admin', 'admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger Function: Sync auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', 'staff');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger: Execute function on every signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Event Themes Table (Preset Library)
CREATE TABLE public.event_themes (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  primary_color text NULL DEFAULT '#059669'::text,
  secondary_color text NULL DEFAULT '#fbbf24'::text,
  background_url text NULL,
  template_id text NULL DEFAULT 'modern'::text,
  theme_config jsonb NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT event_themes_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;


-- 3. Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme_id UUID REFERENCES event_themes(id) ON DELETE SET NULL,
    event_type TEXT DEFAULT 'internal' CHECK (event_type IN ('internal', 'public')),
    name TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    dress_code TEXT,
    logo_url TEXT, 
    wa_template TEXT, 
    external_quota INTEGER DEFAULT 1000, 
    public_reg_status TEXT DEFAULT 'closed' CHECK (public_reg_status IN ('open', 'closed')), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Event Permissions Table (Bridge between Profiles and Events)
CREATE TABLE event_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('manager', 'scanner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- 5. Guests Table
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    guest_type TEXT CHECK (guest_type IN ('internal', 'external', 'tenant')),
    registration_source TEXT DEFAULT 'admin_invite' CHECK (registration_source IN ('admin_invite', 'public_registration')), 
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,      -- For Internal
    address TEXT,    -- For External & Tenant
    metadata JSONB DEFAULT '{}'::jsonb, -- e.g. 'umkm_product' for Tenant
    rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
    invitation_code TEXT UNIQUE, -- QR 1 payload
    bracelet_code TEXT UNIQUE,   -- QR 2 payload
    wa_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Checkins Table (Single session per event)
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    step TEXT CHECK (step IN ('exchange', 'entrance')), 
    checkin_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checkin_by UUID, 
    UNIQUE(guest_id, step) 
);

-- 7. VIEWS
CREATE OR REPLACE VIEW v_pending_wa_invitations AS
SELECT g.*, e.name as event_name
FROM guests g
JOIN events e ON g.event_id = e.id
WHERE g.wa_sent_at IS NULL AND g.phone IS NOT NULL;

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- UNIVERSAL HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_event_access(event_id UUID, required_role TEXT DEFAULT NULL) RETURNS BOOLEAN AS $$
BEGIN
  -- Super admin has all access
  IF is_super_admin() THEN RETURN TRUE; END IF;

  -- Verify permissions for non-super admins
  RETURN EXISTS (
    SELECT 1 FROM event_permissions 
    WHERE user_id = auth.uid() 
    AND event_permissions.event_id = has_event_access.event_id
    AND (required_role IS NULL OR event_permissions.role = required_role)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES: profiles
CREATE POLICY "Super Admins can manage all profiles" ON profiles FOR ALL USING (is_super_admin());
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (id = auth.uid());

-- POLICIES: events
CREATE POLICY "Public can view active events" ON events FOR SELECT USING (true);
CREATE POLICY "Managers can manage their event" ON events FOR ALL USING (has_event_access(id, 'manager'));
CREATE POLICY "Scanners can view their event" ON events FOR SELECT USING (has_event_access(id));

-- POLICIES: guests
CREATE POLICY "Public can read own guest data (via ID)" ON guests FOR SELECT USING (true); -- Restricted in app logic via unique code
CREATE POLICY "Public can update own RSVP" ON guests FOR UPDATE USING (true) WITH CHECK (rsvp_status = 'confirmed');
CREATE POLICY "Internal stuff can read guest list" ON guests FOR SELECT USING (has_event_access(event_id));
CREATE POLICY "Managers can manage guests" ON guests FOR ALL USING (has_event_access(event_id, 'manager'));

-- POLICIES: checkins
CREATE POLICY "Staff can view checkins" ON checkins FOR SELECT USING (
  EXISTS (SELECT 1 FROM guests WHERE guests.id = guest_id AND has_event_access(event_id))
);
CREATE POLICY "Staff can insert checkins" ON checkins FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM guests WHERE guests.id = guest_id AND has_event_access(event_id))
);

-- 9. INDEXES
CREATE INDEX idx_guests_event_id ON guests(event_id);
CREATE INDEX idx_checkins_guest_id ON checkins(guest_id);
CREATE INDEX idx_event_permissions_user_id ON event_permissions(user_id);
CREATE INDEX idx_event_permissions_event_id ON event_permissions(event_id);
