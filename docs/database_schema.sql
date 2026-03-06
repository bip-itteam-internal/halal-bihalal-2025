-- 0. Identity & Roles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('super_admin', 'admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to manage which user has access to which event
CREATE TABLE event_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('manager', 'scanner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
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

-- 1. Event Themes Table (Preset Library)
CREATE TABLE event_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., 'Classic Emerald', 'Modern Corporate'
    primary_color TEXT DEFAULT '#059669',
    secondary_color TEXT DEFAULT '#fbbf24',
    background_url TEXT,
    template_id TEXT DEFAULT 'modern', -- elegant, modern, festive
    theme_config JSONB DEFAULT '{}'::jsonb, -- For font_family, shadow_style, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme_id UUID REFERENCES event_themes(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    dress_code TEXT,
    logo_url TEXT, -- Keep logo in event because it's usually event-specific
    wa_template TEXT, -- Custom message template with placeholders like {name}, {link}
    external_quota INTEGER DEFAULT 1000, -- Added quota for external guests
    public_reg_status TEXT DEFAULT 'closed' CHECK (public_reg_status IN ('open', 'closed')), -- Toggle for registration page
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Guests Table (Updated for Public Registration flexibility)
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    guest_type TEXT CHECK (guest_type IN ('internal', 'external')),
    registration_source TEXT DEFAULT 'admin_invite' CHECK (registration_source IN ('admin_invite', 'public_registration')), -- New: distinguish invite vs self-reg
    full_name TEXT NOT NULL,
    employee_id TEXT,
    department TEXT,
    position TEXT,
    company TEXT, -- Removed default for flexibility
    phone TEXT,
    rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
    wa_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View to help Cron Job identify guests who haven't received WhatsApp invites
CREATE OR REPLACE VIEW v_pending_wa_invitations AS
SELECT g.*, e.name as event_name
FROM guests g
JOIN events e ON g.event_id = e.id
WHERE g.wa_sent_at IS NULL AND g.phone IS NOT NULL;

-- 3. Checkins Table (Updated to support dual sessions and bracelets)
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    session_type TEXT CHECK (session_type IN ('day', 'night')), -- 'siang' or 'malam'
    bracelet_given BOOLEAN DEFAULT FALSE,
    checkin_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checkin_by UUID, -- Reference to admin user if needed
    UNIQUE(guest_id, session_type) -- One guest can check-in once per session
);

-- Indexes for performance
CREATE INDEX idx_guests_event_id ON guests(event_id);
CREATE INDEX idx_checkins_guest_id ON checkins(guest_id);

-- Row Level Security (RLS) - Example for Public Guest Access
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for specific guest by ID" 
ON guests FOR SELECT 
USING (true); -- You might want to restrict this more in production

CREATE POLICY "Allow public update for RSVP" 
ON guests FOR UPDATE 
USING (true)
WITH CHECK (rsvp_status = 'confirmed');
