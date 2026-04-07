import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('event_id')

  const supabase = await createClient()
  try {
    let query = supabase
      .from('doorprize_winners')
      .select('*')
      .order('won_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      status: 'success',
      winners: data || [],
    })
  } catch (error: unknown) {
    console.error('Fetch Winners Error:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil daftar pemenang.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  try {
    const { guest_id, event_id, winner_name, institution_name, category } = await request.json()

    // 1. Record in history table
    const { error: historyError } = await supabase
      .from('doorprize_winners')
      .insert([{
        guest_id,
        event_id,
        winner_name,
        institution_name,
        category
      }])

    if (historyError) throw historyError

    // 2. Mark guest as winner in guests table for backward compatibility
    await supabase
      .from('guests')
      .update({ is_doorprize_winner: true })
      .eq('id', guest_id)

    return NextResponse.json({ status: 'success' })
  } catch (error: unknown) {
    console.error('Record Winner Error:', error)
    return NextResponse.json(
      { message: 'Gagal mencatat pemenang.' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const guestId = searchParams.get('guest_id')

  if (!id) {
    return NextResponse.json({ message: 'ID pemenang diperlukan' }, { status: 400 })
  }

  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from('doorprize_winners')
      .delete()
      .eq('id', id)

    if (error) throw error

    if (guestId) {
      await supabase
        .from('guests')
        .update({ is_doorprize_winner: false })
        .eq('id', guestId)
    }

    return NextResponse.json({ status: 'success' })
  } catch (error: unknown) {
    console.error('Delete Winner Error:', error)
    return NextResponse.json({ message: 'Gagal menghapus pemenang.' }, { status: 500 })
  }
}
