import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('event_id')

  if (!eventId) {
    return NextResponse.json(
      { message: 'event_id is required' },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  try {
    // 1. Get IDs of guests who already won doorprize in THIS event
    const { data: winnersData } = await supabase
      .from('doorprize_winners')
      .select('guest_id')
      .eq('event_id', eventId)

    const winnerIds = new Set(winnersData?.map((w) => w.guest_id) || [])

    // 2. Fetch ALL guests registered for THIS event (via guest_events)
    const { data: mappingData, error } = await supabase
      .from('guest_events')
      .select(
        `
        guest_id,
        guests (
          id,
          full_name,
          guest_type,
          address
        )
      `,
      )
      .eq('event_id', eventId)

    if (error) throw error

    // Extract unique guests EXCEPT those who already won
    const candidatesMap = new Map()
    mappingData?.forEach((m: any) => {
      if (
        m.guests &&
        !candidatesMap.has(m.guest_id) &&
        !winnerIds.has(m.guest_id)
      ) {
        candidatesMap.set(m.guest_id, m.guests)
      }
    })

    const participants = Array.from(candidatesMap.values())

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
