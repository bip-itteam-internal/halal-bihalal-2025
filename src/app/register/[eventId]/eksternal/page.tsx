import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveEventId } from '@/lib/event-identifiers'
import { EksternalRegisterClient } from './eksternal-client'

interface EksternalRegisterPageProps {
  params: Promise<{ eventId: string }>
}

export default async function EksternalRegisterPage({
  params,
}: EksternalRegisterPageProps) {
  const { eventId: identifier } = await params

  const supabase = await createClient()
  const resolvedEventId = await resolveEventId(supabase, identifier)

  if (!resolvedEventId) {
    notFound()
  }

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', resolvedEventId)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <EksternalRegisterClient eventIdentifier={resolvedEventId} event={event} />
  )
}
