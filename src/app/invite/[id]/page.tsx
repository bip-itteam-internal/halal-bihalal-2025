import { adminClient } from '@/lib/supabase/admin'
import { InvitationStatus } from '@/components/modules/invite/invitation-status'
import { InvitePageClient } from '@/components/modules/invite/invite-page-client'
import { isMatchingEventIdentifier } from '@/lib/event-identifiers'
import { Event, EventGuestRule, Guest, PaymentStatus } from '@/types'

type GuestEventRow = {
  event_id: string
  payment_status: PaymentStatus
  payment_proof_url: string | null
  events: (Event & {
    event_guest_rules: EventGuestRule[] | null
  }) | null
}

type InviteGuestRow = Guest & {
  guest_events: GuestEventRow[] | null
}

interface InvitePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ event?: string }>
}

export default async function GuestInvitePage({
  params,
  searchParams,
}: InvitePageProps) {
  try {
    const { id } = await params
    const { event: eventIdentifier } = await searchParams

    const invitationCode = decodeURIComponent(id).trim()

    const { data, error } = await adminClient
      .from('guests')
      .select(
        '*, guest_events(event_id, registration_number, payment_status, payment_proof_url, events(*, event_guest_rules(*)))',
      )
      .eq('invitation_code', invitationCode)
      .single()

    if (error || !data) {
      return <InvitationStatus type="error" message="Undangan tidak ditemukan." />
    }

    const guest = data as InviteGuestRow
    const guestEvents = (guest.guest_events || []).filter(
      (item): item is GuestEventRow => Boolean(item.events),
    )

    if (guestEvents.length === 0) {
      return (
        <InvitationStatus
          type="error"
          message="Tamu tidak terdaftar pada event mana pun."
        />
      )
    }

    const selectedGuestEvent =
      guestEvents.find((item) =>
        eventIdentifier ? isMatchingEventIdentifier(item.events!, eventIdentifier) : false,
      ) || guestEvents[0]

    const selectedEvent = selectedGuestEvent.events
    if (!selectedEvent) {
      return (
        <InvitationStatus
          type="error"
          message="Data event untuk undangan ini tidak lengkap."
        />
      )
    }
    const matchingRule =
      selectedEvent?.event_guest_rules?.find(
        (rule) => rule.guest_type === guest.guest_type,
      ) || null

    const { data: checkinData } = await adminClient
      .from('checkins')
      .select('*')
      .eq('guest_id', guest.id)
      .eq('event_id', selectedEvent.id)
      .eq('step', 'entrance')
      .maybeSingle()

    return (
      <InvitePageClient
        invitationCode={invitationCode}
        guest={guest}
        event={selectedEvent}
        paymentStatus={selectedGuestEvent.payment_status}
        paymentProofUrl={selectedGuestEvent.payment_proof_url}
        openGate={matchingRule?.open_gate || null}
        startTime={matchingRule?.start_time || null}
        checkin={checkinData}
      />
    )
  } catch (error: unknown) {
    return (
      <InvitationStatus
        type="error"
        message={
          error instanceof Error ? error.message : 'Gagal memuat undangan.'
        }
      />
    )
  }
}
