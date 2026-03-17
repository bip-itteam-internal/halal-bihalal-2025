import { SupabaseClient } from '@supabase/supabase-js'
import { toEventSlug } from '@/lib/utils'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i


export function isUuid(value: string) {
  return UUID_REGEX.test(value.trim())
}

export async function resolveEventId(
  supabase: SupabaseClient,
  identifier: string,
) {
  const normalized = identifier.trim()

  if (isUuid(normalized)) {
    return normalized
  }

  const { data: events, error } = await supabase.from('events').select('id, name')
  if (error) throw error

  const slug = toEventSlug(normalized)
  const matched = (events || []).find(
    (event) => toEventSlug(event.name || '') === slug,
  )

  return matched?.id || null
}

export function isMatchingEventIdentifier(
  event: { id: string; name?: string | null },
  identifier: string,
) {
  const normalized = identifier.trim()
  return (
    event.id === normalized || toEventSlug(event.name || '') === toEventSlug(normalized)
  )
}

export function buildInvitePath(
  invitationCode: string,
  eventIdentifier?: string | null,
) {
  const code = encodeURIComponent(invitationCode.trim())
  if (!eventIdentifier) {
    return `/invite/${code}`
  }

  return `/invite/${code}?event=${encodeURIComponent(eventIdentifier)}`
}
