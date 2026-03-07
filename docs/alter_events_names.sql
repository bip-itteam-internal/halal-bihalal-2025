-- Migration to cleanup Events and Checkins (Moving to Multi-Event approach)

-- 1. Remove multi-name columns from events (we will use separate event records instead)
ALTER TABLE events 
DROP COLUMN IF EXISTS public_name,
DROP COLUMN IF EXISTS company_name;

-- 2. Cleanup Checkins (Switching to Multi-Event approach instead of Single-Event Multiple-Sessions)
ALTER TABLE checkins DROP COLUMN IF EXISTS session_type;

-- 3. Update unique constraint for checkins (prevent double checkin for same step)
ALTER TABLE checkins DROP CONSTRAINT IF EXISTS checkins_guest_id_session_type_key;
ALTER TABLE checkins ADD CONSTRAINT checkins_unique_checkin UNIQUE(guest_id, step);

-- 4. Add event type marker (internal/public)
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'internal';
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;
ALTER TABLE events ADD CONSTRAINT events_event_type_check CHECK (event_type IN ('internal', 'public'));
