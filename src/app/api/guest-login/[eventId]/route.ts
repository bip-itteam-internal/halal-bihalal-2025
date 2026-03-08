import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

import { Guest } from '@/types'

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

    const { data: eventGuests, error } = await supabase
      .from('guest_events')
      .select('guests!inner(id, phone, guest_type, created_at)')
      .eq('event_id', eventId)
      .in(
        'guests.guest_type',
        guestType ? [guestType] : ['internal', 'external', 'tenant'],
      )
      .not('guests.phone', 'is', null)
      .order('guests(created_at)', { ascending: false })
      .limit(500)

    if (error) throw error

    const normalizedInputPhone = normalizePhone(phone)

    let matchedGuestObject: {
      id: string
      phone: string
      guest_type: string
    } | null = (eventGuests || []).find((eg) => {
      const g = eg.guests as unknown as Guest
      return normalizePhone(g.phone || '') === normalizedInputPhone
    })?.guests as unknown as { id: string; phone: string; guest_type: string }

    // If not found in this event, check Master Guest list
    if (!matchedGuestObject) {
      // Search in master guests using the last 7 digits for a more efficient lookup
      // This helps narrow down from thousands to just a few candidates
      const searchSuffix = normalizedInputPhone.slice(-7)

      const { data: masterGuests, error: masterError } = await supabase
        .from('guests')
        .select('id, phone, guest_type')
        .in(
          'guest_type',
          guestType ? [guestType] : ['internal', 'external', 'tenant'],
        )
        .ilike('phone', `%${searchSuffix}%`)
        .not('phone', 'is', null)
        .limit(10) // Should be very few matches for the same suffix

      if (masterError) throw masterError

      const masterMatch = (masterGuests || []).find((mg) => {
        return normalizePhone(mg.phone || '') === normalizedInputPhone
      })

      if (masterMatch) {
        // Auto-assign to this event
        const { error: assignError } = await supabase
          .from('guest_events')
          .insert({
            guest_id: masterMatch.id,
            event_id: eventId,
          })

        if (assignError) {
          // If it fails because it's already there (race condition), that's fine
          console.error('Auto-assign error:', assignError)
        }

        matchedGuestObject = masterMatch
      }
    }

    if (!matchedGuestObject) {
      return NextResponse.json(
        {
          message:
            'Nomor WhatsApp tidak ditemukan pada daftar tamu maupun database master.',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      status: 'success',
      guest_id: matchedGuestObject.id,
      guest_type: matchedGuestObject.guest_type,
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
