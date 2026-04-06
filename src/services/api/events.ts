import { createClient } from '@/lib/supabase/client'
import { Event, GuestType, RegistrationSource } from '@/types'

export async function getEvents() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, event_guest_rules(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Event[]
}

export async function getEventCounts(eventIds: string[]) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('guest_events')
    .select('event_id, guests(guest_type, registration_source)')
    .in('event_id', eventIds)

  if (error) throw error

  return (data || []).reduce<Record<string, { external: number; tenant: number }>>(
    (acc, item) => {
      const typedItem = item as unknown as {
        event_id: string
        guests: {
          guest_type: GuestType
          registration_source: RegistrationSource
        } | null
      }
      const eventId = typedItem.event_id
      const guest = typedItem.guests

      if (!acc[eventId]) {
        acc[eventId] = { external: 0, tenant: 0 }
      }

      if (guest) {
        if (guest.guest_type === 'external') acc[eventId].external += 1
        if (guest.guest_type === 'internal') acc[eventId].tenant += 1
      }

      return acc
    },
    {},
  )
}

export async function getEventById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, event_guest_rules(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Event
}

export async function updateEvent(id: string, payload: Partial<Event>) {
  const supabase = createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { event_guest_rules, ...updateData } = payload;

  const { data, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .select('id')

  if (error) {
    throw error
  }

  if (!data || data.length === 0) {
    throw new Error(
      'Gagal menyimpan: Event tidak ditemukan atau Anda tidak memiliki izin akses (RLS).',
    )
  }

  return await getEventById(id)
}

export async function deleteEvent(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function getEventGuestRules(eventId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('event_guest_rules')
    .select('*')
    .eq('event_id', eventId)

  if (error) throw error
  return data as import('@/types').EventGuestRule[]
}

export async function updateEventGuestRule(
  eventId: string,
  guestType: import('@/types').GuestType,
  updates: {
    open_gate: string | null
    close_gate: string | null
    start_time: string | null
  },
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('event_guest_rules')
    .upsert(
      {
        event_id: eventId,
        guest_type: guestType,
        ...updates,
      },
      { onConflict: 'event_id, guest_type' },
    )
    .select()

  if (error) throw error
  return data
}
