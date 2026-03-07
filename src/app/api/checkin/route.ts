import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const body = await req.json()
    const { guest_id, qr_payload, event_id } = body

    if ((!guest_id && !qr_payload) || !event_id) {
      return NextResponse.json(
        { message: 'Kode tamu dan event wajib diisi.' },
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

    // 1. Resolve guest by id / invitation_code
    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const isUUID = UUID_REGEX.test(token)

    let query = supabase
      .from('guests')
      .select('id, full_name, guest_type, invitation_code')

    if (isUUID) {
      query = query.or(`id.eq.${token},invitation_code.eq.${token}`)
    } else {
      query = query.eq('invitation_code', token)
    }

    const { data: guests, error: guestErr } = await query.limit(1)
    const guest = guests?.[0]

    if (guestErr || !guest) {
      return NextResponse.json(
        { message: 'Tamu tidak terdaftar.' },
        { status: 404 },
      )
    }

    // 2. Check Permission for this specific Event
    const { data: eventAccess } = await supabase
      .from('guest_events')
      .select('id')
      .eq('guest_id', guest.id)
      .eq('event_id', event_id)
      .maybeSingle()

    if (!eventAccess) {
      return NextResponse.json(
        { message: 'Tamu tidak terdaftar untuk acara ini.' },
        { status: 403 },
      )
    }

    // 3. Identify Step based on Check-in History
    // First Scan -> exchange, Second Scan -> entrance
    let determinedStep: 'exchange' | 'entrance' = 'exchange'

    const { data: exchangeDone } = await supabase
      .from('checkins')
      .select('id')
      .eq('guest_id', guest.id)
      .eq('event_id', event_id)
      .eq('step', 'exchange')
      .maybeSingle()

    if (exchangeDone) {
      determinedStep = 'entrance'
    }

    // 4. Check for existing 'entrance' to prevent triple scan
    if (determinedStep === 'entrance') {
      const { data: entranceDone } = await supabase
        .from('checkins')
        .select('id')
        .eq('guest_id', guest.id)
        .eq('event_id', event_id)
        .eq('step', 'entrance')
        .maybeSingle()

      if (entranceDone) {
        return NextResponse.json(
          { message: `Tamu ${guest.full_name} sudah masuk sebelumnya.`, guest },
          { status: 409 },
        )
      }
    }

    // 5. Record Check-in
    const { data: newCheckin, error: regErr } = await supabase
      .from('checkins')
      .insert({
        guest_id: guest.id,
        event_id: event_id,
        step: determinedStep,
      })
      .select()
    if (regErr) throw regErr

    const successMessage =
      determinedStep === 'exchange'
        ? `Presensi Berhasil`
        : `Check-in Masuk Berhasil`

    return NextResponse.json(
      {
        status: 'success',
        message: `${successMessage} untuk ${guest.full_name}.`,
        guest: guest,
        checkin: newCheckin,
        step: determinedStep,
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
