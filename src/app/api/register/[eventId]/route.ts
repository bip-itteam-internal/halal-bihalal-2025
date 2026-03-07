import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function toEventSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function resolveEventId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  identifier: string,
) {
  const normalized = identifier.trim()

  if (UUID_REGEX.test(normalized)) {
    return normalized
  }

  const { data: events, error } = await supabase.from('events').select('id, name')
  if (error) throw error

  const slug = toEventSlug(normalized)
  const matched = (events || []).find(
    (event) => toEventSlug(event.name || '') === slug,
  )

  return matched?.id || null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const supabase = await createClient()
  const { eventId: identifier } = await params
  const eventId = await resolveEventId(supabase, identifier)

  if (!eventId) {
    return NextResponse.json(
      { message: 'Event tidak ditemukan.' },
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
      { message: 'Event tidak ditemukan.' },
      { status: 404 },
    )
  }

  return NextResponse.json(event)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const supabase = await createClient()
  try {
    const { eventId: identifier } = await params
    const eventId = await resolveEventId(supabase, identifier)
    const body = await req.json()
    const fullName =
      typeof body.full_name === 'string' ? body.full_name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const address = typeof body.address === 'string' ? body.address.trim() : ''
    const guestType = body.guest_type === 'tenant' ? 'tenant' : 'external'
    const umkmProduct =
      typeof body.metadata?.umkm_product === 'string'
        ? body.metadata.umkm_product.trim()
        : ''

    if (!eventId) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan.' },
        { status: 404 },
      )
    }

    if (!fullName || !phone || !address) {
      return NextResponse.json(
        { message: 'Nama, nomor WhatsApp, dan alamat wajib diisi.' },
        { status: 400 },
      )
    }

    if (guestType === 'tenant' && (!address || !umkmProduct)) {
      return NextResponse.json(
        { message: 'Data tenant belum lengkap (alamat dan produk UMKM wajib).' },
        { status: 400 },
      )
    }

    // 1. Get Event Quota and Current Public Registration Count
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('external_quota, public_reg_status')
      .eq('id', eventId)
      .single()

    if (eventErr || !event) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan.' },
        { status: 404 },
      )
    }

    if (event.public_reg_status === 'closed') {
      return NextResponse.json(
        { message: 'Registrasi publik sudah ditutup.' },
        { status: 403 },
      )
    }

    // 2. Count current public guests (external + tenant)
    const { count, error: countErr } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('registration_source', 'public_registration')

    if (countErr) throw countErr

    if (count !== null && count >= event.external_quota) {
      return NextResponse.json(
        { message: 'Mohon maaf, kuota pendaftaran publik sudah penuh.' },
        { status: 403 },
      )
    }

    // 3. Register Guest
    const { data: guest, error: regErr } = await supabase
      .from('guests')
      .insert({
        event_id: eventId,
        full_name: fullName,
        phone,
        address,
        guest_type: guestType,
        metadata: guestType === 'tenant' ? { umkm_product: umkmProduct } : {},
        registration_source: 'public_registration',
        rsvp_status: 'confirmed',
      })
      .select()
      .single()

    if (regErr) throw regErr

    return NextResponse.json(
      {
        status: 'success',
        guest_id: guest.id,
        qr_payload: guest.id,
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Registration Error:', error)
    return NextResponse.json(
      {
        message: 'Terjadi kesalahan sistem.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
