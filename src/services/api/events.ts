import { createClient } from '@/lib/supabase/client'
import { Event, GuestType, RegistrationSource } from '@/types'

export async function getEvents() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Event[]
}

export async function getEventCounts(eventIds: string[]) {
  const supabase = createClient()
  // Fetch counts from guest_events junction table instead of directly from guests
  const { data, error } = await supabase
    .from('guest_events')
    .select('event_id, guests(guest_type, registration_source)')
    .in('event_id', eventIds)

  if (error) throw error

  const counts = (data || []).reduce<
    Record<string, { external: number; tenant: number }>
  >((acc, item) => {
    const typedItem = item as unknown as {
      event_id: string
      guests: {
        guest_type: GuestType
        registration_source: RegistrationSource
      } | null
    }
    const eventId = typedItem.event_id
    const guest = typedItem.guests

    if (!guest || guest.registration_source !== 'public_registration') {
      return acc
    }

    if (!acc[eventId]) {
      acc[eventId] = { external: 0, tenant: 0 }
    }

    if (guest.guest_type === 'tenant') {
      acc[eventId].tenant++
    } else {
      acc[eventId].external++
    }
    return acc
  }, {})

  return counts
}

export async function getEventById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Event
}

export async function updateEvent(id: string, payload: Partial<Event>) {
  const supabase = createClient()
  console.log('Attempting update for event:', id, payload)

  // Update with select('id') to check if rows were actually affected
  const { data, error, status } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select('id')

  if (error) {
    console.error('Update failed. Status:', status, 'Error:', error)
    throw error
  }

  if (!data || data.length === 0) {
    // This happens if ID doesn't match or RLS blocks the update
    throw new Error(
      'Gagal menyimpan: Event tidak ditemukan atau Anda tidak memiliki izin akses (RLS).',
    )
  }

  console.log('Update success, affected rows:', data.length)

  // Fetch the full updated object
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
