import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, '')
}

function toEventSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function resolveEventId(
  supabase: ReturnType<typeof createAdminClient>,
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId: identifier } = await params
    const body = await req.json()

    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const guestType =
      body.guest_type === 'internal'
        ? 'internal'
        : body.guest_type === 'tenant'
        ? 'tenant'
        : body.guest_type === 'external'
          ? 'external'
          : null

    if (!phone) {
      return NextResponse.json(
        { message: 'Nomor WhatsApp wajib diisi.' },
        { status: 400 },
      )
    }

    const supabase = createAdminClient()
    const eventId = await resolveEventId(supabase, identifier)
    if (!eventId) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan.' },
        { status: 404 },
      )
    }

    const { data: guests, error } = await supabase
      .from('guests')
      .select('id, phone, guest_type, created_at')
      .eq('event_id', eventId)
      .in(
        'guest_type',
        guestType ? [guestType] : ['internal', 'external', 'tenant'],
      )
      .not('phone', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error

    const normalizedInputPhone = normalizePhone(phone)

    const matchedGuest = (guests || []).find((guest) => {
      const guestPhone = normalizePhone(guest.phone || '')
      return guestPhone === normalizedInputPhone
    })

    if (!matchedGuest) {
      return NextResponse.json(
        { message: 'Nomor WhatsApp tidak ditemukan pada daftar tamu event ini.' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      status: 'success',
      guest_id: matchedGuest.id,
      guest_type: matchedGuest.guest_type,
    })
  } catch (error: unknown) {
    console.error('Guest Login Error:', error)
    return NextResponse.json(
      {
        message: 'Terjadi kesalahan sistem.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
