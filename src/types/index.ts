export type GuestType = 'internal' | 'external';
export type RSVPStatus = 'pending' | 'confirmed' | 'declined';
export type RegistrationSource = 'admin_invite' | 'public_registration';
export type SessionType = 'siang' | 'malam';

export interface Event {
  id: string;
  theme_id?: string;
  name: string;
  description?: string;
  event_date: string;
  location?: string;
  dress_code?: string;
  logo_url?: string;
  wa_template?: string;
  external_quota: number;
  public_reg_status: 'open' | 'closed';
  created_at: string;
}

export interface Guest {
  id: string;
  event_id: string;
  guest_type: GuestType;
  registration_source: RegistrationSource;
  full_name: string;
  employee_id?: string;
  department?: string;
  position?: string;
  company?: string;
  phone?: string;
  rsvp_status: RSVPStatus;
  wa_sent_at?: string;
  created_at: string;
}

export interface Checkin {
  id: string;
  guest_id: string;
  session_type: SessionType;
  bracelet_given: boolean;
  checkin_time: string;
  checkin_by?: string;
}
