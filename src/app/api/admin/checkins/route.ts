import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

    if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Fetch checkins with guest and event info (simplified to debug)
    const { data, error } = await supabase
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
      .order('checkin_time', { ascending: false })

    if (error) throw error

    // Manual Join: Fetch all profiles to link with checkin_by
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')

    const enrichedData = (data || []).map(item => ({
      ...item,
      staff: profiles?.find(p => p.id === item.checkin_by) || null
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
