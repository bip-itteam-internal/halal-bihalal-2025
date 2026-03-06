export type GuestType = 'internal' | 'external' | 'tenant'
export type RSVPStatus = 'pending' | 'confirmed' | 'declined'
export type RegistrationSource = 'admin_invite' | 'public_registration'
export type EventType = 'internal' | 'public'
export type PublicRegistrationStatus = 'open' | 'closed'
export type CheckinStep = 'exchange' | 'entrance'
export type LegacySessionType = 'siang' | 'malam'

export type GuestMetadata = {
  umkm_product?: string
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, unknown>
    | unknown[]
}

export type ThemeFontFamilyToken =
  | 'inter'
  | 'outfit'
  | 'playfair'
  | 'poppins'
  | 'space-grotesk'
  | 'source-serif'

export type ThemeShadowPresetToken =
  | 'none'
  | 'soft'
  | 'card'
  | 'lifted'
  | 'dramatic'

export interface ThemeConfigTokens {
  body_font?: ThemeFontFamilyToken
  heading_font?: ThemeFontFamilyToken
  shadow_preset?: ThemeShadowPresetToken
}

export interface Event {
  id: string
  theme_id?: string | null
  name: string
  event_type?: EventType | null
  description?: string | null
  event_date: string
  location?: string | null
  dress_code?: string | null
  logo_url?: string | null
  wa_template?: string | null
  external_quota: number
  public_reg_status: PublicRegistrationStatus
  created_at: string
}

export interface Guest {
  id: string
  event_id: string
  guest_type: GuestType
  registration_source: RegistrationSource
  full_name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  metadata: GuestMetadata
  invitation_code?: string | null
  bracelet_code?: string | null
  rsvp_status: RSVPStatus
  wa_sent_at?: string | null
  created_at: string
}

export interface Checkin {
  id: string
  guest_id: string
  step: CheckinStep
  // Deprecated: keep for backward compatibility on legacy pages.
  session_type?: LegacySessionType
  checkin_time: string
  checkin_by?: string | null
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

export interface EventTheme {
  id: string
  name: string
  primary_color: string
  secondary_color: string
  background_url?: string | null
  template_id: string
  theme_config: ThemeConfigTokens
  created_at: string
}
