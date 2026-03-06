'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { Guest, Event as AppEvent, EventTheme } from '@/types'

// Define the joined type for invitation
type GuestInvitation = Guest & {
  event: AppEvent & {
    theme: EventTheme | null
  }
}

// Modular Components
import { InvitationCover } from '@/components/modules/invite/invitation-cover'
import { InvitationContent } from '@/components/modules/invite/invitation-content'
import { InvitationStatus } from '@/components/modules/invite/invitation-status'
import { MosaicBackground } from '@/components/modules/invite/mosaic-background'

export default function GuestInvitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const guestId = resolvedParams.id

  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [guest, setGuest] = useState<GuestInvitation | null>(null)
  const [event, setEvent] = useState<AppEvent | null>(null)
  const [theme, setTheme] = useState<EventTheme | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select(
            `
            *,
            event:events (
              *,
              theme:event_themes (*)
            )
          `,
          )
          .eq('id', guestId)
          .single()

        if (guestError) throw guestError
        if (!guestData) throw new Error('Undangan tidak ditemukan.')

        setGuest(guestData as GuestInvitation)
        setEvent(guestData.event as AppEvent)
        setTheme(guestData.event?.theme as EventTheme | null)
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Gagal memuat undangan.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [guestId, supabase])

  const handleRSVP = async (status: 'confirmed' | 'declined') => {
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
          colors: [
            theme?.primary_color || '#009262',
            theme?.secondary_color || '#fbbf24',
          ],
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

  const primaryColor = theme?.primary_color || '#009262'
  const secondaryColor = theme?.secondary_color || '#fbbf24'

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#fafafa] font-sans selection:bg-emerald-100">
      {/* Dynamic Theme Styles */}
      <style jsx global>{`
        :root {
          --invite-primary: ${primaryColor};
          --invite-secondary: ${secondaryColor};
        }
      `}</style>

      {/* Background Watermark Pattern */}
      <MosaicBackground logoUrl={event?.logo_url} />

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <InvitationCover
            event={event}
            guest={guest}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onOpen={() => setIsOpen(true)}
          />
        ) : (
          <InvitationContent
            event={event}
            guest={guest}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            isUpdating={isUpdating}
            onRSVP={handleRSVP}
            onBack={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
