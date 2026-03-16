import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveEventId } from '@/lib/event-identifiers'
import { TenantRegisterClient } from './tenant-client'

interface TenantRegisterPageProps {
  params: Promise<{ eventId: string }>
}

export default async function TenantRegisterPage({
  params,
}: TenantRegisterPageProps) {
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
    <TenantRegisterClient eventIdentifier={resolvedEventId} event={event} />
  )
}
