import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createClient()

  try {
    // Check if user is admin/super_admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('event_id')

    // Fetch checkins with guest and event info
    let query = supabase
      .from('checkins')
      .select(`
        *,
        guests (
          full_name,
          phone,
          guest_type
        ),
        events (
          name
        )
      `)

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data, error } = await query.order('checkin_time', { ascending: false })

    if (error) throw error

    // Manual Join: Fetch all profiles to link with checkin_by
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name')

    if (profileErr) {
      console.error('Profile fetch error:', profileErr)
    }

    const enrichedData = (data || []).map(item => ({
      ...item,
      staff: item.checkin_by 
        ? profiles?.find(p => p.id === item.checkin_by) || null 
        : null
    }))

    return NextResponse.json(enrichedData)
  } catch (error: unknown) {
    console.error('Fetch Checkins Error:', error)
    return NextResponse.json(
      { message: 'Gagal memuat log check-in.' },
      { status: 500 }
    )
  }
}
