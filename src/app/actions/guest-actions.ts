'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteGuestAction(id: string, eventId?: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('guests').delete().eq('id', id)

  if (error) {
    return { success: false, message: error.message }
  }

  if (eventId) {
    revalidatePath(`/events/${eventId}`)
  }

  return { success: true, message: 'Tamu berhasil dihapus' }
}
