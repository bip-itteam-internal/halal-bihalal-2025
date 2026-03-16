import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ invitationCode: string }> },
) {
  try {
    const { invitationCode } = await params
    const body = await req.json()
    const paymentProofUrl =
      typeof body?.payment_proof_url === 'string'
        ? body.payment_proof_url.trim()
        : ''
    const eventId =
      typeof body?.event_id === 'string' ? body.event_id.trim() : ''

    if (!paymentProofUrl || !eventId) {
      return NextResponse.json(
        { message: 'URL bukti pembayaran dan event wajib diisi.' },
        { status: 400 },
      )
    }

    const { data: guest, error: guestError } = await adminClient
      .from('guests')
      .select('id')
      .eq('invitation_code', decodeURIComponent(invitationCode))
      .single()

    if (guestError || !guest) {
      return NextResponse.json(
        { message: 'Undangan tidak ditemukan.' },
        { status: 404 },
      )
    }

    const { data: guestEvent, error: guestEventError } = await adminClient
      .from('guest_events')
      .select('id, payment_status')
      .eq('guest_id', guest.id)
      .eq('event_id', eventId)
      .single()

    if (guestEventError || !guestEvent) {
      return NextResponse.json(
        { message: 'Data pembayaran event tidak ditemukan.' },
        { status: 404 },
      )
    }

    if (guestEvent.payment_status !== 'pending') {
      return NextResponse.json(
        { message: 'Bukti pembayaran hanya bisa diubah sebelum diverifikasi.' },
        { status: 409 },
      )
    }

    const { error: updateError } = await adminClient
      .from('guest_events')
      .update({ payment_proof_url: paymentProofUrl })
      .eq('id', guestEvent.id)

    if (updateError) throw updateError

    return NextResponse.json({
      message: 'Bukti pembayaran berhasil diperbarui.',
      payment_proof_url: paymentProofUrl,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Gagal memperbarui bukti pembayaran.',
      },
      { status: 500 },
    )
  }
}
