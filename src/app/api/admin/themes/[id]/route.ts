import { adminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = adminClient
  const body = await request.json()

  // Remove id and created_at from body to avoid potential primary key/metadata errors
  const updateData = { ...body }
  delete updateData.id
  delete updateData.created_at

  const { data, error } = await supabase
    .from('event_themes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = adminClient

  const { error } = await supabase.from('event_themes').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Theme deleted successfully' })
}
