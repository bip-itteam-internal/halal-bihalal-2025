import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const body = await req.json()
    const { invitation_code, qr_payload, event_id } = body

    if ((!invitation_code && !qr_payload) || !event_id) {
      return NextResponse.json(
        { message: 'Kode undangan dan event wajib diisi.' },
        { status: 400 },
      )
    }

    const token = (invitation_code || qr_payload || '').trim()
    if (!token) {
      return NextResponse.json(
        { message: 'Kode undangan tidak boleh kosong.' },
        { status: 400 },
      )
    }

    const { data: guests, error: guestErr } = await supabase
      .from('guests')
      .select('id, full_name, guest_type, invitation_code')
      .eq('invitation_code', token)
      .limit(1)
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

    // 4. Check for existing scan to prevent duplicate
    const { data: alreadyScanned } = await supabase
      .from('checkins')
      .select('id')
      .eq('guest_id', guest.id)
      .eq('event_id', event_id)
      .eq('step', determinedStep)
      .maybeSingle()

    if (alreadyScanned) {
      const stepLabel =
        determinedStep === 'exchange' ? 'Hadir Halal Bihalal' : 'Masuk Konser'

      return NextResponse.json(
        {
          message: `Tamu ${guest.full_name} sudah ${stepLabel} sebelumnya.`,
          guest,
        },
        { status: 409 },
      )
    }

    // 5. Record Check-in
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { message: 'Sesi panitia berakhir. Silakan login kembali.' },
        { status: 401 },
      )
    }

    // Optional: Verify role if needed, but usually any logged in staff/admin can scan
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
      return NextResponse.json(
        { message: 'Anda tidak memiliki otoritas untuk menscan.' },
        { status: 403 },
      )
    }

    const { data: newCheckin, error: regErr } = await supabase
      .from('checkins')
      .insert({
        guest_id: guest.id,
        event_id: event_id,
        step: determinedStep,
        checkin_by: user.id,
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
