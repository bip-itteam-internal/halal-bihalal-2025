export interface RawGuest {
  full_name: string
  guest_type: 'internal' | 'external'
  phone: string
  email?: string
  address?: string
  registration_number?: number
  shirt_size?: string
}

export type ImportStep = 'upload' | 'mapping' | 'preview'

export interface ColumnMapping {
  full_name: string
  guest_type: string
  phone: string
  email: string
  address: string
  registration_number: string
  shirt_size: string
}
