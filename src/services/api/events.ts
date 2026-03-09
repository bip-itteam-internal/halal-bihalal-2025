import { createClient } from '@/lib/supabase/client'
import { Event } from '@/types'

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
  const { data, error } = await supabase
    .from('guests')
    .select('event_id, guest_type')
    .in('event_id', eventIds)
    .eq('registration_source', 'public_registration')

  if (error) throw error

  const counts = (data || []).reduce<
    Record<string, { external: number; tenant: number }>
  >((acc, guest) => {
    if (!acc[guest.event_id]) {
      acc[guest.event_id] = { external: 0, tenant: 0 }
    }
    if (guest.guest_type === 'tenant') {
      acc[guest.event_id].tenant++
    } else {
      acc[guest.event_id].external++
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
  const { data, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function deleteEvent(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}
