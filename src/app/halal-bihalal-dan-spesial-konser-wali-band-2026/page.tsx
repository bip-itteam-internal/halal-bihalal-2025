import { createClient } from '@/lib/supabase/server'
import { LandingClient } from '@/components/modules/register/landing-client'
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

  const { data: publicGuests } =
    eventIds.length > 0
      ? await supabase
          .from('guests')
          .select('event_id, guest_type')
          .in('event_id', eventIds)
          .eq('registration_source', 'public_registration')
      : { data: [] }

  const registrationsByEvent = (publicGuests ?? []).reduce<
    Record<string, { external: number; tenant: number }>
  >((acc, guest) => {
    if (!acc[guest.event_id]) {
      acc[guest.event_id] = { external: 0, tenant: 0 }
    }
    if (guest.guest_type === 'tenant') {
      acc[guest.event_id].tenant++
    } else {
      acc[guest.event_id].external++
    }
    return acc
  }, {})

  // Fetch event guest rules
  const { data: guestRules } = await supabase
    .from('event_guest_rules')
    .select('*')
    .in('event_id', eventIds)

  return (
    <LandingClient
      events={(events || []) as unknown as Event[]}
      registrationsByEvent={registrationsByEvent}
      guestRules={guestRules || []}
    />
  )
}
