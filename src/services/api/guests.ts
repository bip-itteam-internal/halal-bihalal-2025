import { createClient } from '@/lib/supabase/client'
import { Guest } from '@/types'

export interface GetGuestsParams {
  page: number
  pageSize: number
  searchQuery?: string
  eventId?: string
}

export async function getGuests({
  page,
  pageSize,
  searchQuery,
  eventId,
}: GetGuestsParams) {
  const supabase = createClient()
  let query = supabase
    .from('guests')
    .select('*, guest_events(event_id, events(name))', { count: 'exact' })

  if (searchQuery) {
    query = query.ilike('full_name', `%${searchQuery}%`)
  }

  if (eventId) {
    query = query.eq('event_id', eventId)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    guests: data as Guest[],
    totalCount: count || 0,
  }
}

export async function deleteGuest(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('guests').delete().eq('id', id)
  if (error) throw error
}

export async function updateGuest(id: string, payload: Partial<Guest>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('guests')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Guest
}
