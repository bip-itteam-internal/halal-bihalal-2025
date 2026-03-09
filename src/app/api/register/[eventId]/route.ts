import { NextResponse } from 'next/server'
import { adminClient as supabase } from '@/lib/supabase/admin'
import { generateRandomCode, toEventSlug } from '@/lib/utils'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function resolveEventId(identifier: string) {
  const normalized = identifier.trim()

  // 1. Direct UUID match
  if (UUID_REGEX.test(normalized)) {
    return normalized
  }

  // 2. Fallback to name slug search
  const { data: events, error } = await supabase
    .from('events')
    .select('id, name')
  if (error) throw error

  const slug = toEventSlug(normalized)
  const matched = (events || []).find(
    (event) => toEventSlug(event.name || '') === slug,
  )

  return matched?.id || null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const resolvedParams = await params
    const identifier = resolvedParams.eventId
    const eventId = await resolveEventId(identifier)

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
    const eventId = await resolveEventId(identifier)

    if (!eventId) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan.' },
        { status: 404 },
      )
    }

    const body = await request.json()
    const {
      full_name: fullName,
      phone,
      guest_type: guestType,
      address,
      metadata,
    } = body

    const umkmProduct = metadata?.umkm_product || ''

    if (!fullName || !phone) {
      return NextResponse.json(
        { message: 'Nama dan Nomor WhatsApp wajib diisi.' },
        { status: 400 },
      )
    }

    // 1. Check Event Status and Quota
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select(
        'public_reg_status, external_quota, tenant_quota, is_paid, is_tenant_paid, price_external',
      )
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
    const isPaymentRequired =
      guestType === 'tenant'
        ? event.is_tenant_paid
        : event.is_paid && (event.price_external || 0) > 0

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

    const limit =
      guestType === 'tenant' ? event.tenant_quota : event.external_quota
    if (currentGuests && currentGuests >= (limit || 0)) {
      return NextResponse.json(
        { message: 'Kuota pendaftaran untuk tipe ini sudah penuh.' },
        { status: 403 },
      )
    }

    // Check Duplicate
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id, metadata')
      .eq('phone', phone)
      .single()

    if (existingGuest) {
      // Check if already in this event
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

    // 3. Register Guest (Master Profile)
    const invitationCode = `${generateRandomCode(6)}`

    let guestId: string
    if (!existingGuest) {
      const { data: guest, error: regErr } = await supabase
        .from('guests')
        .insert({
          full_name: fullName,
          phone,
          address: address || '',
          guest_type: guestType,
          metadata: guestType === 'tenant' ? { umkm_product: umkmProduct } : {},
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
      // Update existing guest info if needed
      await supabase
        .from('guests')
        .update({
          full_name: fullName,
          address: address || '',
          rsvp_status: isPaymentRequired ? 'pending' : 'confirmed',
          guest_type: guestType,
          metadata:
            guestType === 'tenant'
              ? { umkm_product: umkmProduct }
              : existingGuest.metadata,
        })
        .eq('id', guestId)
    }

    // 4. Assign to Event
    const { error: eventErr2 } = await supabase.from('guest_events').insert({
      guest_id: guestId,
      event_id: eventId,
      payment_proof_url: paymentProofUrl,
      payment_status: isPaymentRequired ? 'pending' : 'verified',
    })

    if (eventErr2) throw eventErr2

    return NextResponse.json(
      {
        status: 'success',
        guest_id: guestId,
        qr_payload: invitationCode,
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
