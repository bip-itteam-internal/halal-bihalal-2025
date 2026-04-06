import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { id } = await params
  try {
    const { is_winner } = await request.json()

    const { data, error } = await supabase
      .from('guests')
      .update({ is_doorprize_winner: is_winner })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({
      status: 'success',
      guest: data[0],
    })
  } catch (error: unknown) {
    console.error('Update Winner Error:', error)
    return NextResponse.json(
      { message: 'Gagal mengupdate status pemenang.' },
      { status: 500 },
    )
  }
}
