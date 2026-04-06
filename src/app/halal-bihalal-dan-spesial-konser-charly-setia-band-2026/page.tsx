import { createClient } from '@/lib/supabase/server'
import { LandingClientV2 as LandingClient } from '@/components/modules/register/landing-client-v2'
import { Event } from '@/types'

export default async function EksternalPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', 'public')
    .in('public_reg_status', ['open', 'closed'])
    .order('event_date', { ascending: true })

  const eventIds = (events ?? []).map((event) => event.id)

  // Fetch event guest rules
  const { data: guestRules } = await supabase
    .from('event_guest_rules')
    .select('*')
    .in('event_id', eventIds)

  return (
    <LandingClient
      events={(events || []) as unknown as Event[]}
      guestRules={guestRules || []}
    />
  )
}
