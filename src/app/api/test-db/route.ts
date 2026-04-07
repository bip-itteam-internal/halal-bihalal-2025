import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  try {
    const {
      data: guests,
      error: gError,
      count: gCount,
    } = await supabase
      .from('guests')
      .select('*', { count: 'exact' })
      .limit(1)

    const {
      data: checkins,
      error: cError,
      count: cCount,
    } = await supabase
      .from('checkins')
      .select('id', { count: 'exact' })
      .limit(5)

    const {
      data: events,
      error: eError,
      count: eCount,
    } = await supabase
      .from('events')
      .select('id, name', { count: 'exact' })
      .limit(5)

    return NextResponse.json({
      guests: { count: gCount, data: guests, error: gError },
      checkins: { count: cCount, data: checkins, error: cError },
      events: { count: eCount, data: events, error: eError },
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
