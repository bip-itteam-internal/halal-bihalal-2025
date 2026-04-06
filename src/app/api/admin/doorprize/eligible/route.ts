import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  try {
    // 1. Fetch checkins instead of guests first to guarantee they are checked in
    const { data: checkinData, error } = await supabase.from('checkins')
      .select(`
        guest_id,
        guests (
          id,
          full_name,
          guest_type,
          address,
          is_doorprize_winner
        )
      `)
      .not('guests.is_doorprize_winner', 'is', true)

    if (error) throw error

    // Extract unique guests from checkins
    const uniqueGuestsMap = new Map()
    checkinData?.forEach((c: { guest_id: string; guests: unknown }) => {
      if (c.guests && !uniqueGuestsMap.has(c.guest_id)) {
        uniqueGuestsMap.set(c.guest_id, c.guests)
      }
    })

    const participants = Array.from(uniqueGuestsMap.values())

    return NextResponse.json({
      status: 'success',
      count: participants.length,
      candidates: participants,
    })
  } catch (error: unknown) {
    console.error('Doorprize API Error:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data peserta doorprize.' },
      { status: 500 },
    )
  }
}
