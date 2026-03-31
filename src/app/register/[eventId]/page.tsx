import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveEventId } from '@/lib/event-identifiers'
import { RegisterEventClient } from './register-client'

interface RegisterPageProps {
  params: Promise<{ eventId: string }>
}

export default async function RegisterPage({
  params,
}: RegisterPageProps) {
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
    <RegisterEventClient
      eventIdentifier={identifier}
      event={event}
    />
  )
}
