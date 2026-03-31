import { createClient } from '@/lib/supabase/client'
import { CheckinStep, GuestType, PaymentStatus, RSVPStatus } from '@/types'

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

export interface DashboardBreakdown {
  internal: number
  external: number
}

export interface DashboardRSVPStats {
  confirmed: number
  pending: number
  declined: number
}

export interface DashboardPaymentStats {
  verified: number
  pending: number
  rejected: number
}

export interface DashboardCheckinStats {
  exchange: number
  entrance: number
}

export interface DashboardRecentCheckin {
  id: string
  checkin_time: string
  step: CheckinStep
  guests: {
    full_name: string
    guest_type: GuestType
  } | null
  events: {
    name: string
  } | null
}

export async function getDashboardData() {
  const supabase = createClient()

  const [
    eventsRes,
    upcomingEventsRes,
    eventsCountRes,
    guestsRes,
    guestTypeRes,
    rsvpRes,
    paymentRes,
    checkinsRes,
    checkinStepsRes,
    recentCheckinsRes,
  ] = await Promise.all([
    supabase
      .from('events')
      .select('id,name,event_date,event_type,public_reg_status')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('events')
      .select('id,name,event_date,event_type,public_reg_status')
      .gte('event_date', new Date().toISOString().slice(0, 10))
      .order('event_date', { ascending: true })
      .limit(3),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('guests').select('id', { count: 'exact', head: true }),
    supabase.from('guests').select('guest_type'),
    supabase.from('guests').select('rsvp_status'),
    supabase.from('guest_events').select('payment_status'),
    supabase.from('checkins').select('id', { count: 'exact', head: true }),
    supabase.from('checkins').select('step'),
    supabase
      .from('checkins')
      .select('id, checkin_time, step, guests(full_name, guest_type), events(name)')
      .order('checkin_time', { ascending: false })
      .limit(6),
  ])

  if (eventsRes.error) throw eventsRes.error
  if (upcomingEventsRes.error) throw upcomingEventsRes.error
  if (eventsCountRes.error) throw eventsCountRes.error
  if (guestsRes.error) throw guestsRes.error
  if (guestTypeRes.error) throw guestTypeRes.error
  if (rsvpRes.error) throw rsvpRes.error
  if (paymentRes.error) throw paymentRes.error
  if (checkinsRes.error) throw checkinsRes.error
  if (checkinStepsRes.error) throw checkinStepsRes.error
  if (recentCheckinsRes.error) throw recentCheckinsRes.error

  const recentEvents = (eventsRes.data || []) as DashboardEvent[]
  const upcomingEvents = (upcomingEventsRes.data || []) as DashboardEvent[]

  const stats: DashboardStats = {
    totalEvents: eventsCountRes.count || 0,
    totalGuests: guestsRes.count || 0,
    checkedIn: checkinsRes.count || 0,
    openPublicEvents: recentEvents.filter(
      (event) =>
        event.event_type === 'public' && event.public_reg_status === 'open',
    ).length,
  }

  const guestTypeStats = (guestTypeRes.data || []).reduce<DashboardBreakdown>(
    (acc, item) => {
      const guestType = item.guest_type as GuestType | null
      if (guestType === 'internal') acc.internal += 1
      if (guestType === 'external') acc.external += 1
      return acc
    },
    { internal: 0, external: 0 },
  )

  const rsvpStats = (rsvpRes.data || []).reduce<DashboardRSVPStats>(
    (acc, item) => {
      const status = item.rsvp_status as RSVPStatus | null
      if (status === 'confirmed') acc.confirmed += 1
      else if (status === 'declined') acc.declined += 1
      else acc.pending += 1
      return acc
    },
    { confirmed: 0, pending: 0, declined: 0 },
  )

  const paymentStats = (paymentRes.data || []).reduce<DashboardPaymentStats>(
    (acc, item) => {
      const status = item.payment_status as PaymentStatus | null
      if (status === 'verified') acc.verified += 1
      else if (status === 'rejected') acc.rejected += 1
      else if (status === 'pending') acc.pending += 1
      return acc
    },
    { verified: 0, pending: 0, rejected: 0 },
  )

  const checkinStats = (checkinStepsRes.data || []).reduce<DashboardCheckinStats>(
    (acc, item) => {
      const step = item.step as CheckinStep | null
      if (step === 'exchange') acc.exchange += 1
      if (step === 'entrance') acc.entrance += 1
      return acc
    },
    { exchange: 0, entrance: 0 },
  )

  return {
    recentEvents,
    upcomingEvents,
    stats,
    guestTypeStats,
    rsvpStats,
    paymentStats,
    checkinStats,
    recentCheckins: (recentCheckinsRes.data || []).map(
      (item: Record<string, unknown>) => ({
        ...item,
        guests: Array.isArray(item.guests)
          ? item.guests[0]
          : item.guests || null,
        events: Array.isArray(item.events)
          ? item.events[0]
          : item.events || null,
      }),
    ) as DashboardRecentCheckin[],
  }
}
