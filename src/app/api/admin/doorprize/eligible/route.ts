import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  try {
    // 1. Fetch Guest who are internal and have a checkin for the 'malam' session
    const { data: guests, error } = await supabase
      .from('guests')
      .select('id, full_name, guest_type, address')

    if (error) throw error

    return NextResponse.json({
      status: 'success',
      count: guests?.length || 0,
      candidates: guests,
    })
  } catch (error: unknown) {
    console.error('Doorprize API Error:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data peserta doorprize.' },
      { status: 500 },
    )
  }
}
