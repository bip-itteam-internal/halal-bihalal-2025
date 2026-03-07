import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const {
      guest_id,
      qr_payload,
      event_id,
      step = 'entrance',
    } = await req.json()

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
    // Note: We use a more specific query to know WHICH field matched
    const { data: guests, error: guestErr } = await supabase
      .from('guests')
      .select(
        'id, full_name, guest_type, event_id, invitation_code, bracelet_code',
      )
      .or(
        `id.eq.${token},invitation_code.eq.${token},bracelet_code.eq.${token}`,
      )
      .limit(1)

    const guest = guests?.[0]

    if (guestErr || !guest) {
      return NextResponse.json(
        { message: 'Tamu tidak terdaftar.' },
        { status: 404 },
      )
    }

    const matchedAsBracelet = token === guest.bracelet_code
    const matchedAsInvitation =
      token === guest.invitation_code || token === guest.id

    if (guest.event_id !== event_id) {
      return NextResponse.json(
        { message: 'Tamu tidak terdaftar untuk event ini.' },
        { status: 403 },
      )
    }

    // 2. Logic based on STEP
    if (step === 'exchange') {
      // PROSES PENUKARAN GELANG (BARCODE 1)
      if (matchedAsBracelet) {
        return NextResponse.json(
          {
            message: 'Gunakan Kode Undangan (Barcode 1) untuk tahap penukaran.',
          },
          { status: 400 },
        )
      }

      // Check if already exchanged
      const { data: existingExchange } = await supabase
        .from('checkins')
        .select('id')
        .eq('guest_id', guest.id)
        .eq('step', 'exchange')
        .maybeSingle()

      if (existingExchange) {
        return NextResponse.json(
          {
            message: `Tamu ini sudah melakukan penukaran gelang.`,
            guest,
            alreadyCheckedIn: true,
          },
          { status: 409 },
        )
      }

      // If a new bracelet code is provided in the body (from the pairing scan), update guest
      const { bracelet_to_pair } = await req.json().catch(() => ({}))
      if (bracelet_to_pair) {
        const { error: updateErr } = await supabase
          .from('guests')
          .update({ bracelet_code: bracelet_to_pair })
          .eq('id', guest.id)

        if (updateErr) {
          if (updateErr.code === '23505') {
            return NextResponse.json(
              { message: 'Gelang ini sudah digunakan tamu lain.' },
              { status: 400 },
            )
          }
          throw updateErr
        }
        guest.bracelet_code = bracelet_to_pair
      }
    } else if (step === 'entrance') {
      // PROSES MASUK ACARA (BARCODE 2)

      // a. Check if exchange step is missing
      const { data: exchangeDone } = await supabase
        .from('checkins')
        .select('id')
        .eq('guest_id', guest.id)
        .eq('step', 'exchange')
        .maybeSingle()

      if (!exchangeDone) {
        return NextResponse.json(
          {
            message: 'Tamu belum melakukan penukaran gelang (Step 1).',
            requireExchange: true,
            guest,
          },
          { status: 403 },
        )
      }

      // b. Verify they are using the bracelet (Barcode 2) if it was paired
      if (guest.bracelet_code && matchedAsInvitation) {
        return NextResponse.json(
          { message: 'Tamu wajib menggunakan Gelang (Barcode 2) untuk masuk.' },
          { status: 400 },
        )
      }
    }

    // 3. Check for existing check-in for this specific step
    const { data: existingCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('guest_id', guest.id)
      .eq('step', step)
      .maybeSingle()

    if (existingCheckin) {
      return NextResponse.json(
        { message: `Tamu sudah check-in (${step}).`, guest },
        { status: 409 },
      )
    }

    // 4. Record Check-in
    const { data: newCheckin, error: regErr } = await supabase
      .from('checkins')
      .insert({
        guest_id: guest.id,
        step,
      })
      .select()
    if (regErr) throw regErr

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
