import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { toEventSlug } from '@/lib/utils'
import { RegisterEventClient } from './register-client'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function resolveEventId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  identifier: string,
) {
  const normalized = identifier.trim()

  // 1. Direct UUID match
  if (UUID_REGEX.test(normalized)) {
    return normalized
  }

  // 2. Fallback to name slug search
  const { data: events, error } = await supabase
    .from('events')
    .select('id, name')
  if (error) throw error

  const slug = toEventSlug(normalized)
  const matched = (events || []).find(
    (event) => toEventSlug(event.name || '') === slug,
  )

  return matched?.id || null
}

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
