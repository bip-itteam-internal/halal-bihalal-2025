import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const { guest_id, qr_payload, event_id, step = 'entrance' } =
      await req.json()

    if ((!guest_id && !qr_payload) || !event_id) {
      return NextResponse.json(
        { message: 'Kode tamu dan event wajib diisi.' },
        { status: 400 },
      )
    }

    if (!['exchange', 'entrance'].includes(step)) {
      return NextResponse.json(
        { message: 'Step check-in tidak valid.' },
        { status: 400 },
      )
    }

    const token = (guest_id || qr_payload || '').trim()
    if (!token) {
      return NextResponse.json(
        { message: 'Kode tamu tidak boleh kosong.' },
        { status: 400 },
      )
    }

    // 1. Resolve guest by id / invitation_code / bracelet_code
    const { data: guest, error: guestErr } = await supabase
      .from('guests')
      .select('id, full_name, guest_type, event_id, address, metadata')
      .or(
        `id.eq.${token},invitation_code.eq.${token},bracelet_code.eq.${token}`,
      )
      .limit(1)
      .maybeSingle()

    if (guestErr || !guest) {
      return NextResponse.json(
        { message: 'Tamu tidak terdaftar.' },
        { status: 404 },
      )
    }

    if (guest.event_id !== event_id) {
      return NextResponse.json(
        { message: 'Tamu tidak terdaftar untuk event ini.' },
        { status: 403 },
      )
    }

    // 2. Check for existing check-in for this step
    const { data: existingCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('guest_id', guest.id)
      .eq('step', step)
      .maybeSingle()

    if (existingCheckin) {
      return NextResponse.json(
        { message: `Tamu sudah check-in (${step}).` },
        { status: 409 },
      )
    }

    // 3. Record Check-in
    const { data: newCheckin, error: regErr } = await supabase
      .from('checkins')
      .insert({
        guest_id: guest.id,
        step,
      })
      .select()
      .single()

    if (regErr) throw regErr

    // Optional: Update guest bracelet status if tracked on guest table (it's not currently, it's just in checkins or guest metadata)

    return NextResponse.json(
      {
        status: 'success',
        message: `Check-in ${step} berhasil untuk ${guest.full_name}.`,
        guest: guest,
        checkin: newCheckin,
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Check-in Error:', error)
    return NextResponse.json(
      {
        message: 'Terjadi kesalahan sistem.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
