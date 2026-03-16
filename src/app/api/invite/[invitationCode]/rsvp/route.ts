import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

const RSVP_VALUES = ['pending', 'confirmed', 'declined'] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ invitationCode: string }> },
) {
  try {
    const { invitationCode } = await params
    const body = await req.json()
    const status = body?.rsvp_status

    if (!RSVP_VALUES.includes(status)) {
      return NextResponse.json(
        { message: 'Status RSVP tidak valid.' },
        { status: 400 },
      )
    }

    const { error } = await adminClient
      .from('guests')
      .update({ rsvp_status: status })
      .eq('invitation_code', decodeURIComponent(invitationCode))

    if (error) throw error

    return NextResponse.json({ message: 'Konfirmasi berhasil disimpan.' })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Gagal menyimpan konfirmasi.',
      },
      { status: 500 },
    )
  }
}
