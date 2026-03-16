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

    const supabase = adminClient
    const eventId = await resolveEventId(supabase, identifier)
    if (!eventId) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan.' },
        { status: 404 },
      )
    }

    const { data: eventGuests, error } = await supabase
      .from('guest_events')
      .select('guests!inner(id, phone, guest_type, invitation_code, created_at)')
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

    const matchedGuestObject: {
      id: string
      phone: string
      guest_type: string
      invitation_code: string | null
    } | null = (eventGuests || []).find((eg) => {
      const g = eg.guests as unknown as Guest
      return normalizePhone(g.phone || '') === normalizedInputPhone
    })?.guests as unknown as {
      id: string
      phone: string
      guest_type: string
      invitation_code: string | null
    }

    if (!matchedGuestObject) {
      return NextResponse.json(
        {
          message: 'Nomor WhatsApp tidak terdaftar untuk event ini.',
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
