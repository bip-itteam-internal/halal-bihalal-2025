import { NextResponse } from 'next/server'
import { adminClient as supabase } from '@/lib/supabase/admin'
import { generateRandomCode } from '@/lib/utils'
import { resolveEventId } from '@/lib/event-identifiers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const resolvedParams = await params
    const identifier = resolvedParams.eventId
    const eventId = await resolveEventId(supabase, identifier)

    if (!eventId) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan' },
        { status: 404 },
      )
    }

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error || !event) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan' },
        { status: 404 },
      )
    }

    return NextResponse.json(event)
  } catch (error: unknown) {
    console.error('GET Event Error:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const resolvedParams = await params
    const identifier = resolvedParams.eventId
    const eventId = await resolveEventId(supabase, identifier)

    if (!eventId) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan.' },
        { status: 404 },
      )
    }

    const body = await request.json()
    const {
      full_name: fullName,
      guest_type: guestType,
      address,
      shirt_size: shirtSize,
    } = body

    // Normalize phone number (digits only)
    const phone = body.phone ? String(body.phone).replace(/\D/g, '') : null

    if (!fullName || !phone) {
      return NextResponse.json(
        { message: 'Nama dan Nomor WhatsApp wajib diisi.' },
        { status: 400 },
      )
    }

    // 1. Check Event Status and Quota
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('public_reg_status, external_quota, is_paid, price_external')
      .eq('id', eventId)
      .single()

    if (eventErr || !event) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan.' },
        { status: 404 },
      )
    }

    if (event.public_reg_status !== 'open') {
      return NextResponse.json(
        { message: 'Pendaftaran untuk event ini sudah ditutup.' },
        { status: 403 },
      )
    }

    // 2. Check if payment required
    const isPaymentRequired = event.is_paid && (event.price_external || 0) > 0

    const paymentProofUrl = body.payment_proof_url || null

    if (isPaymentRequired && !paymentProofUrl) {
      return NextResponse.json(
        {
          message:
            'Bukti pembayaran wajib diunggah untuk pendaftaran kategori ini.',
        },
        { status: 400 },
      )
    }

    // Check Quota
    const { count: currentGuests } = await supabase
      .from('guest_events')
      .select('id, guests!inner(guest_type)', { count: 'exact' })
      .eq('event_id', eventId)
      .eq('guests.guest_type', guestType)

    const limit = event.external_quota
    if (currentGuests && currentGuests >= (limit || 0)) {
      return NextResponse.json(
        { message: 'Kuota pendaftaran untuk tipe ini sudah penuh.' },
        { status: 403 },
      )
    }

    // Check Duplicate
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id, metadata, invitation_code')
      .eq('phone', phone)
      .single()

    if (existingGuest) {
      const { data: existingMap } = await supabase
        .from('guest_events')
        .select('id')
        .eq('guest_id', existingGuest.id)
        .eq('event_id', eventId)
        .single()

      if (existingMap) {
        return NextResponse.json(
          { message: 'Nomor WhatsApp ini sudah terdaftar di sistem.' },
          { status: 400 },
        )
      }
    }

    // 3. Register Guest
    const invitationCode =
      existingGuest?.invitation_code || `INV-${generateRandomCode(6)}`

    let guestId: string
    if (!existingGuest) {
      const { data: guest, error: regErr } = await supabase
        .from('guests')
        .insert({
          full_name: fullName,
          phone,
          address: address || '',
          shirt_size: shirtSize || null,
          guest_type: guestType,
          metadata: {},
          registration_source: 'public_registration',
          rsvp_status: isPaymentRequired ? 'pending' : 'confirmed',
          invitation_code: invitationCode,
        })
        .select()
        .single()

      if (regErr) throw regErr
      guestId = guest.id
    } else {
      guestId = existingGuest.id
      await supabase
        .from('guests')
        .update({
          full_name: fullName,
          address: address || '',
          shirt_size: shirtSize || null,
          rsvp_status: isPaymentRequired ? 'pending' : 'confirmed',
          guest_type: guestType,
          invitation_code: invitationCode,
          metadata: existingGuest.metadata,
        })
        .eq('id', guestId)
    }

    // 4. Assign to Event
    const { error: eventErr2 } = await supabase.from('guest_events').insert({
      guest_id: guestId,
      event_id: eventId,
      payment_proof_url: paymentProofUrl,
      payment_status: isPaymentRequired ? 'pending' : 'verified',
      // Note: registration_number will be set by a database trigger if NULL
    })

    if (eventErr2) throw eventErr2

    return NextResponse.json(
      {
        status: 'success',
        invitation_code: invitationCode,
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Registration Error:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Terjadi kesalahan sistem',
      },
      { status: 500 },
    )
  }
}
