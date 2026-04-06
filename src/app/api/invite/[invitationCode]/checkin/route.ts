import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ invitationCode: string }> },
) {
  try {
    const { invitationCode } = await params
    const { event_id, step: explicitlyStep } = await req.json()

    if (!event_id) {
      return NextResponse.json(
        { message: 'ID Acara diperlukan untuk check-in.' },
        { status: 400 },
      )
    }

    // 1. Get Guest by invitation code
    const token = decodeURIComponent(invitationCode).trim()
    const { data: guest, error: guestErr } = await adminClient
      .from('guests')
      .select('id, full_name')
      .eq('invitation_code', token)
      .maybeSingle()

    if (guestErr || !guest) {
      return NextResponse.json(
        { message: 'Tamu tidak terdaftar.' },
        { status: 404 },
      )
    }

    // 2. Check if Guest is registered for this Event
    const { data: eventAccess } = await adminClient
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

    // 3. Identify Step
    let determinedStep: 'exchange' | 'entrance' = 'exchange'
    
    if (explicitlyStep === 'exchange' || explicitlyStep === 'entrance') {
      determinedStep = explicitlyStep
    } else {
      // Fallback to automatic logic
      const { data: exchangeDone } = await adminClient
        .from('checkins')
        .select('id')
        .eq('guest_id', guest.id)
        .eq('event_id', event_id)
        .eq('step', 'exchange')
        .maybeSingle()
  
      if (exchangeDone) {
        determinedStep = 'entrance'
      }
    }

    // 4. Check for existing scan of the same step
    const { data: alreadyScanned } = await adminClient
      .from('checkins')
      .select('id')
      .eq('guest_id', guest.id)
      .eq('event_id', event_id)
      .eq('step', determinedStep)
      .maybeSingle()

    if (alreadyScanned) {
      return NextResponse.json(
        { message: 'Anda sudah melakukan check-in sebelumnya.' },
        { status: 409 },
      )
    }

    // 5. Record Self Check-in
    const { data: newCheckin, error: regErr } = await adminClient
      .from('checkins')
      .insert({
        guest_id: guest.id,
        event_id: event_id,
        step: determinedStep,
      })
      .select()
      .single()

    if (regErr) throw regErr
    
    // 6. Automatically Update RSVP Status to confirmed (as requested)
    await adminClient
      .from('guests')
      .update({ rsvp_status: 'confirmed' })
      .eq('id', guest.id)

    return NextResponse.json(
      {
        message: 'Check-in mandiri berhasil.',
        checkin: newCheckin,
        step: determinedStep,
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Self Check-in Error:', error)
    return NextResponse.json(
      {
        message: 'Terjadi kesalahan sistem.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
