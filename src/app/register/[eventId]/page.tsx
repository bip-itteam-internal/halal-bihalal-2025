import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveEventId } from '@/lib/event-identifiers'
import { RegisterEventClient } from './register-client'

interface RegisterPageProps {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ type?: string }>
}

export default async function RegisterPage({
  params,
  searchParams,
}: RegisterPageProps) {
  const { eventId: identifier } = await params
  const { type } = await searchParams

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

  const initialType =
    type === 'tenant' ? 'tenant' : type === 'external' ? 'external' : null

  return (
    <RegisterEventClient
      eventIdentifier={identifier}
      event={event}
      initialType={initialType}
    />
  )
}
