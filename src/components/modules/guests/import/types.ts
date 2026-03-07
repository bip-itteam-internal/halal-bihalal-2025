export interface RawGuest {
  full_name: string
  guest_type: 'internal' | 'external' | 'tenant'
  phone: string
  email?: string
  address?: string
}

export type ImportStep = 'upload' | 'mapping' | 'preview'

export interface ColumnMapping {
  full_name: string
  guest_type: string
  phone: string
  email: string
  address: string
}

export interface EventOption {
  id: string
  name: string
}
