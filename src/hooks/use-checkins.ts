import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface CheckinLog {
  id: string
  guest_id: string
  event_id: string
  step: 'exchange' | 'entrance'
  checkin_time: string
  checkin_by: string | null
  guests: {
    full_name: string
    phone: string
    guest_type: string
  }
  events: {
    name: string
  }
  staff: {
    full_name: string
    email: string
  } | null
}

export function useCheckins(eventId?: string) {
  const [loading, setLoading] = useState(true)
  const [checkins, setCheckins] = useState<CheckinLog[]>([])

  const fetchCheckins = useCallback(async () => {
    try {
      setLoading(true)
      const url = eventId 
        ? `/api/admin/checkins?event_id=${eventId}`
        : '/api/admin/checkins'
        
      const res = await fetch(url)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Gagal memuat log check-in')
      }
      const data = await res.json()
      setCheckins(data)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchCheckins()
  }, [fetchCheckins])

  return {
    loading,
    checkins,
    refresh: fetchCheckins
  }
}
