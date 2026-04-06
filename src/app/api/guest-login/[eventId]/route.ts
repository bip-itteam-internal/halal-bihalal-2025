import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { resolveEventId } from '@/lib/event-identifiers'

import { Guest } from '@/types'

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, '')
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId: identifierParam } = await params // Renamed to avoid conflict with body.identifier
    const body = await req.json()

    const identifier =
      typeof body.identifier === 'string' ? body.identifier.trim() : ''
    const guestType =
      body.guest_type === 'internal'
        ? 'internal'
        : body.guest_type === 'tenant'
          ? 'tenant'
          : body.guest_type === 'external'
            ? 'external'
            : null

    if (!identifier) {
      return NextResponse.json(
        { message: 'Nomor WhatsApp atau Email wajib diisi.' },
        { status: 400 },
      )
    }

    const supabase = adminClient
    const eventId = await resolveEventId(supabase, identifierParam)
    if (!eventId) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan.' },
        { status: 404 },
      )
    }

    const isPhone = /^[0-9]+$/.test(identifier) && !identifier.includes('@')
    const isEmail = identifier.includes('@')
    const normalizedIdentifier = isEmail
      ? identifier.toLowerCase()
      : isPhone
        ? normalizePhone(identifier)
        : identifier.toLowerCase()

    const { data: eventGuests, error } = await supabase
      .from('guest_events')
      .select(
        'guests!inner(id, full_name, phone, email, guest_type, invitation_code, created_at)',
      )
      .eq('event_id', eventId)
      .in(
        'guests.guest_type',
        guestType ? [guestType] : ['internal', 'external', 'tenant'],
      )
      .order('guests(created_at)', { ascending: false })
      .limit(1000)

    if (error) throw error

    const matchedGuestObject = (eventGuests || []).find((eg) => {
      const g = eg.guests as unknown as Guest & {
        email?: string
        full_name?: string
      }

      if (isEmail) {
        return g.email?.toLowerCase() === normalizedIdentifier
      } else if (isPhone) {
        return normalizePhone(g.phone || '') === normalizedIdentifier
      } else {
        // Search by Full Name (Exact Match, Case Insensitive)
        return g.full_name?.toLowerCase() === normalizedIdentifier
      }
    })?.guests as unknown as {
      id: string
      full_name: string
      phone: string
      email: string
      guest_type: string
      invitation_code: string | null
    }

    if (!matchedGuestObject) {
      return NextResponse.json(
        {
          message: `${isEmail ? 'Email' : isPhone ? 'Nomor WhatsApp' : 'Nama'} tidak terdaftar untuk event ini.`,
        },
        { status: 404 },
      )
    }

    if (!matchedGuestObject.invitation_code) {
      return NextResponse.json(
        {
          message: 'Undangan tamu belum memiliki kode akses.',
        },
        { status: 409 },
      )
    }

    // --- AUTO CHECK-IN LOGIC ---
    // Record check-in automatically upon login (Self-Checkin)
    const { data: existingCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('guest_id', matchedGuestObject.id)
      .eq('event_id', eventId)
      .eq('step', 'entrance')
      .single()

    if (!existingCheckin) {
      const { error: checkinError } = await supabase.from('checkins').insert({
        guest_id: matchedGuestObject.id,
        event_id: eventId,
        step: 'entrance',
        checkin_time: new Date().toISOString(),
      })

      if (checkinError) {
        console.error('Auto Check-in Error:', checkinError)
        // We don't block the login if check-in fails, just log it.
      }
    }

    return NextResponse.json({
      status: 'success',
      invitation_code: matchedGuestObject.invitation_code,
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
