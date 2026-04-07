'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteGuestAction(id: string, eventId?: string) {
  const supabase = await createClient()

  if (eventId) {
    // 1. Remove checkin logs for this specific event
    const { error: checkinError } = await supabase
      .from('checkins')
      .delete()
      .eq('guest_id', id)
      .eq('event_id', eventId)

    if (checkinError) {
      return { success: false, message: checkinError.message }
    }

    // 2. Remove the mapping in guest_events
    const { error: mapError } = await supabase
      .from('guest_events')
      .delete()
      .eq('guest_id', id)
      .eq('event_id', eventId)

    if (mapError) {
      return { success: false, message: mapError.message }
    }

    revalidatePath(`/admin/events/${eventId}/guests`)
    revalidatePath(`/admin/events/${eventId}`)
    return { success: true, message: 'Tamu dilepas dari acara dan log cekin dihapus' }
  }

  // Fallback to global delete if no eventId is provided (Cascades to all guest_events and checkins)
  const { error } = await supabase.from('guests').delete().eq('id', id)

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: 'Tamu dihapus dari database' }
}

export async function clearEventGuestsAction(eventId: string) {
  const supabase = await createClient()

  // 1. Clear checkin logs for this event
  const { error: checkinError } = await supabase
    .from('checkins')
    .delete()
    .eq('event_id', eventId)

  if (checkinError) {
    return { success: false, message: checkinError.message }
  }

  // 2. Clear guest associations for this event
  const { error: mapError } = await supabase
    .from('guest_events')
    .delete()
    .eq('event_id', eventId)

  if (mapError) {
    return { success: false, message: mapError.message }
  }

  revalidatePath(`/admin/events/${eventId}/guests`)
  revalidatePath(`/admin/events/${eventId}`)

  return { success: true, message: 'Daftar tamu dan log cekin berhasil dikosongkan' }
}

export async function updateGuestAction(
  id: string,
  guestUpdates: Record<string, unknown>,
  eventId?: string,
  eventUpdates?: Record<string, unknown>,
) {
  const supabase = await createClient()

  // 1. Update Guest Table
  const { error: guestError } = await supabase
    .from('guests')
    .update(guestUpdates)
    .eq('id', id)

  if (guestError) {
    return { success: false, message: guestError.message }
  }

  // 2. Update Guest Event Table (if mapping data is provided)
  if (eventId && eventUpdates) {
    const { error: mapError } = await supabase
      .from('guest_events')
      .update(eventUpdates)
      .eq('guest_id', id)
      .eq('event_id', eventId)

    if (mapError) {
      return { success: false, message: mapError.message }
    }
  }

  if (eventId) {
    revalidatePath(`/admin/events/${eventId}/guests`)
    revalidatePath(`/admin/events/${eventId}`)
  }

  return { success: true, message: 'Data tamu berhasil diperbarui' }
}
