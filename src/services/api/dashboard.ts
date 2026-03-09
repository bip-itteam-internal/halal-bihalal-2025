import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
  totalEvents: number
  totalGuests: number
  checkedIn: number
  openPublicEvents: number
}

export interface DashboardEvent {
  id: string
  name: string
  event_date: string
  event_type: 'internal' | 'public' | null
  public_reg_status: 'open' | 'closed'
}

export async function getDashboardData() {
  const supabase = createClient()

  const [eventsRes, eventsCountRes, guestsRes, checkinsRes] = await Promise.all(
    [
      supabase
        .from('events')
        .select('id,name,event_date,event_type,public_reg_status')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('guests').select('id', { count: 'exact', head: true }),
      supabase.from('checkins').select('id', { count: 'exact', head: true }),
    ],
  )

  if (eventsRes.error) throw eventsRes.error
  if (eventsCountRes.error) throw eventsCountRes.error
  if (guestsRes.error) throw guestsRes.error
  if (checkinsRes.error) throw checkinsRes.error

  const recentEvents = (eventsRes.data || []) as DashboardEvent[]

  const stats: DashboardStats = {
    totalEvents: eventsCountRes.count || 0,
    totalGuests: guestsRes.count || 0,
    checkedIn: checkinsRes.count || 0,
    openPublicEvents: recentEvents.filter(
      (event) =>
        event.event_type === 'public' && event.public_reg_status === 'open',
    ).length,
  }

  return {
    recentEvents,
    stats,
  }
}
