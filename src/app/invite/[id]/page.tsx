'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { Guest, Event as AppEvent } from '@/types'
import { decodeUUID } from '@/lib/utils'

// Define the joined type for invitation
type GuestInvitation = Guest & {
  event: AppEvent
}

// Modular Components
import { InvitationStatus } from '@/components/modules/invite/invitation-status'
import { MosaicBackground } from '@/components/modules/invite/mosaic-background'
import { TemplateRenderer } from '@/components/modules/invite/TemplateRenderer'
import { INVITATION_TEMPLATES as templates } from '@/lib/constants/templates'

export default function GuestInvitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  // Extract identifier part before the hyphen and name
  // If it's the old 36-chars UUID, handle it properly!
  const rawIdPart =
    resolvedParams.id.length >= 36 && resolvedParams.id.charAt(8) === '-'
      ? resolvedParams.id.substring(0, 36)
      : resolvedParams.id.substring(0, 22)

  const guestId = decodeUUID(rawIdPart)

  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [guest, setGuest] = useState<GuestInvitation | null>(null)
  const [event, setEvent] = useState<AppEvent | null>(null)
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
            event:events (*)
          `,
          )
          .eq('id', guestId)
          .single()

        if (guestError) throw guestError
        if (!guestData) throw new Error('Undangan tidak ditemukan.')

        setGuest(guestData as GuestInvitation)
        setEvent(guestData.event as AppEvent)
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Gagal memuat undangan.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [guestId, supabase])

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
    </div>
  )
}
