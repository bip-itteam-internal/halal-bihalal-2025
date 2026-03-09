'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { Guest, Event as AppEvent } from '@/types'
import { decodeUUID } from '@/lib/utils'
import slugify from 'slugify'
import { usePathname } from 'next/navigation'

// Define the joined type for invitation
type GuestInvitation = Guest & {
  event: AppEvent
}

// Modular Components
import { InvitationStatus } from '@/components/modules/invite/invitation-status'

function toEventSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
import { MosaicBackground } from '@/components/modules/invite/mosaic-background'
import { TemplateRenderer } from '@/components/modules/invite/TemplateRenderer'
import { INVITATION_TEMPLATES as templates } from '@/lib/constants/templates'

import { FloatingMusicPlayer } from '@/components/modules/invite/music-player'

export default function GuestInvitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const pathname = usePathname()

  // Extract ID part (either 22 chars short-id or 36 chars UUID)
  let rawIdPart = ''
  let remainingPath = ''

  if (
    resolvedParams.id.length >= 36 &&
    (resolvedParams.id.match(/-/g) || []).length >= 4
  ) {
    // Looks like a full UUID (8-4-4-4-12)
    // We split by hyphen and take the first 5 parts to reconstruct the UUID
    const parts = resolvedParams.id.split('-')
    rawIdPart = parts.slice(0, 5).join('-')
    remainingPath = parts.slice(5).join('-')
  } else {
    // Looks like an obfuscated ID (Base64URL length is exactly 22)
    rawIdPart = resolvedParams.id.substring(0, 22)
    remainingPath = resolvedParams.id.substring(23) // Skip the hyphen after the 22 chars
  }

  const guestId = rawIdPart.length === 36 ? rawIdPart : decodeUUID(rawIdPart)

  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [guest, setGuest] = useState<GuestInvitation | null>(null)
  const [event, setEvent] = useState<AppEvent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [shouldPlayMusic, setShouldPlayMusic] = useState(true)

  // Trigger music when invitation is opened
  useEffect(() => {
    if (isOpen) {
      setShouldPlayMusic(true)
    }
  }, [isOpen])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // 1. Fetch Guest Profile
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('*')
          .eq('id', guestId)
          .single()

        if (guestError || !guestData)
          throw new Error('Undangan tidak ditemukan.')

        // 2. Fetch Events for this Guest via Junction Table
        const { data: mappingData, error: mapError } = await supabase
          .from('guest_events')
          .select('events(*)')
          .eq('guest_id', guestId)

        if (mapError || !mappingData || mappingData.length === 0) {
          throw new Error('Tamu tidak terdaftar di acara manapun.')
        }

        const guestEvents = mappingData
          .map((m) => m.events)
          .filter(Boolean) as unknown as AppEvent[]

        // 3. Determine which event to show based on the URL suffix
        let targetEvent = guestEvents[0]
        if (remainingPath) {
          const matched = guestEvents.find((e) => {
            const s1 = slugify(e.name || '', { lower: true, strict: true })
            const s2 = toEventSlug(e.name || '')
            const eid = e.id

            return (
              remainingPath === s1 ||
              remainingPath === s2 ||
              remainingPath === eid ||
              remainingPath.endsWith('-' + s1) ||
              remainingPath.endsWith('-' + s2) ||
              remainingPath.endsWith('-' + eid) ||
              remainingPath.startsWith('guest-' + s1) ||
              remainingPath.startsWith('guest-' + eid)
            )
          })
          if (matched) targetEvent = matched
        }

        setGuest({ ...guestData, event: targetEvent } as GuestInvitation)
        setEvent(targetEvent)

        // Automatically open the invitation for Tenant or External guests
        if (
          guestData.guest_type === 'tenant' ||
          guestData.guest_type === 'external'
        ) {
          setIsOpen(true)
        }
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Gagal memuat undangan.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [guestId, supabase, resolvedParams.id, remainingPath])

  // Pretty URL sync: Update URL to include name/event if it's just a raw ID
  useEffect(() => {
    if (!guest || !event || loading) return

    const nameSlug = slugify(guest.full_name || '', {
      lower: true,
      strict: true,
    })
    const eventSlug = slugify(event.name || '', { lower: true, strict: true })
    // Using real UUID (guest.id)
    const targetPath = `/invite/${guest.id}-${nameSlug}-${eventSlug}`

    if (pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath)
    }

    // Update document title for better user experience
    document.title = `Undangan ${guest.full_name} - ${event.name}`
  }, [guest, event, loading, pathname, remainingPath])

  const handleRSVP = async (status: 'confirmed' | 'declined' | 'pending') => {
    try {
      setIsUpdating(true)
      const { error: updateError } = await supabase
        .from('guests')
        .update({ rsvp_status: status })
        .eq('id', guestId)

      if (updateError) throw updateError

      setGuest((prev) => (prev ? { ...prev, rsvp_status: status } : null))

      if (status === 'confirmed') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#009262', '#fbbf24'],
        })
        toast.success('Konfirmasi kehadiran berhasil disimpan!')
      } else {
        toast.info('Konfirmasi ketidakhadiran berhasil disimpan.')
      }
    } catch {
      toast.error('Gagal menyimpan konfirmasi.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) return <InvitationStatus type="loading" />
  if (error || !guest)
    return <InvitationStatus type="error" message={error || undefined} />

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#fafafa] font-sans selection:bg-emerald-100">
      {/* Background Watermark Pattern */}
      <MosaicBackground
        logoUrl={event?.logo_url}
        isFullScreen={true}
        opacity={
          templates.find((t) => t.id === event?.template_id)?.config
            .mosaicOpacity ?? 0.1
        }
      />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <TemplateRenderer
            templateId={event?.template_id}
            event={event as unknown as AppEvent}
            guest={guest}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onRSVP={handleRSVP}
            isUpdating={isUpdating}
          />
        </AnimatePresence>
      </div>

      {/* Floating Music Player for Festive/Halal Events */}
      {event?.template_id === 'festive-halal' && (
        <FloatingMusicPlayer
          url="https://bbqtqcwjjzzfbyrlehdc.supabase.co/storage/v1/object/public/event-assets/music/lebaran.mp3"
          autoPlay={shouldPlayMusic}
        />
      )}
    </div>
  )
}
