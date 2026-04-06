import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('id, full_name, guest_type, address, updated_at')
      .eq('is_doorprize_winner', true)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      status: 'success',
      winners: data,
    })
  } catch (error: unknown) {
    console.error('Fetch Winners Error:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil daftar pemenang.' },
      { status: 500 },
    )
  }
}
