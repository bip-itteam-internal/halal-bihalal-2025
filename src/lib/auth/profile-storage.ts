import { UserRole } from '@/types'

const PROFILE_KEY = 'bip_user_profile'

export interface CachedProfile {
  id: string
  role: UserRole
  full_name?: string
  email?: string
}

export const profileStorage = {
  save: (profile: CachedProfile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    }
  },
  get: (): CachedProfile | null => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PROFILE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored) as CachedProfile
        } catch (e) {
          console.error('Failed to parse stored profile', e)
          return null
        }
      }
    }
    return null
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROFILE_KEY)
    }
  },
}
