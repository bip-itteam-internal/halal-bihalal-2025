import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types'
import { profileStorage, CachedProfile } from '@/lib/auth/profile-storage'

export function useProfile() {
  const [profile, setProfile] = useState<CachedProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = useCallback(
    async (force = false) => {
      try {
        if (!force) {
          const cached = profileStorage.get()
          if (cached) {
            setProfile(cached)
            setLoading(false)
            return cached
          }
        }

        setLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setProfile(null)
          profileStorage.clear()
          return null
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, role, full_name')
          .eq('id', user.id)
          .single()

        if (error) throw error

        const newProfile: CachedProfile = {
          id: profileData.id,
          role: profileData.role as UserRole,
          full_name: profileData.full_name,
          email: user.email,
        }

        profileStorage.save(newProfile)
        setProfile(newProfile)
        return newProfile
      } catch (error) {
        console.error('Error fetching profile:', error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    role: profile?.role || ('staff' as UserRole),
    loading,
    refresh: () => fetchProfile(true),
    clear: () => {
      setProfile(null)
      profileStorage.clear()
    },
  }
}
