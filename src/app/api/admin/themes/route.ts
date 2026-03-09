import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = adminClient

  const { data, error } = await supabase
    .from('event_themes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = adminClient
  const body = await request.json()

  const { data, error } = await supabase
    .from('event_themes')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
