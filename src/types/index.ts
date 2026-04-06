export type GuestType = 'internal' | 'external'
export type RSVPStatus = 'pending' | 'confirmed' | 'declined'
export type PaymentStatus = 'pending' | 'verified' | 'rejected'
export type RegistrationSource = 'admin_invite' | 'public_registration'
export type EventType = 'internal' | 'public'
export type PublicRegistrationStatus = 'open' | 'closed'
export type CheckinStep = 'exchange' | 'entrance'
export type LegacySessionType = 'siang' | 'malam'

export type GuestMetadata = {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, unknown>
    | unknown[]
}

export interface Event {
  id: string
  name: string
  event_date: string
  location?: string | null
  logo_url?: string | null
  wa_template?: string | null
  external_quota: number
  public_reg_status: PublicRegistrationStatus
  event_type?: EventType | null
  template_id?: string | null
  is_paid: boolean
  price_external: number
  payment_info?: string | null
  created_at: string
  event_guest_rules?: EventGuestRule[]
}

export interface Guest {
  id: string
  guest_type: GuestType
  registration_source: RegistrationSource
  full_name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  shirt_size?: string | null
  metadata: GuestMetadata
  invitation_code?: string | null
  rsvp_status: RSVPStatus
  wa_sent_at?: string | null
  guest_events?: {
    event_id: string
    payment_status: PaymentStatus
    registration_number?: number | null
    events: {
      name: string
    } | null
  }[]
  payment_proof_url?: string
  payment_status?: PaymentStatus
  registration_number?: number | null
  created_at: string
}

export interface Checkin {
  id: string
  guest_id: string
  step: CheckinStep
  // Deprecated: keep for backward compatibility on legacy pages.
  session_type?: LegacySessionType
  checkin_time: string
}

export type UserRole = 'super_admin' | 'admin' | 'staff'
export type PermissionRole = 'manager' | 'scanner'

export interface Profile {
  id: string
  full_name?: string
  role: UserRole
  created_at: string
}

export interface EventPermission {
  id: string
  user_id: string
  event_id: string
  role: PermissionRole
  created_at: string
}

export interface EventGuestRule {
  id: string
  event_id: string
  guest_type: GuestType
  open_gate: string | null
  close_gate: string | null
  start_time: string | null
  created_at: string
}
