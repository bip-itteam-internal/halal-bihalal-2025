'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { Event as AppEvent, Guest, PaymentStatus } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { InvitationStatus } from '@/components/modules/invite/invitation-status'
import { MosaicBackground } from '@/components/modules/invite/mosaic-background'
import { TemplateRenderer } from '@/components/modules/invite/TemplateRenderer'
import { INVITATION_TEMPLATES as templates } from '@/lib/constants/templates'
import { FloatingMusicPlayer } from '@/components/modules/invite/music-player'
import { FloatingWhatsApp } from '@/components/ui/floating-whatsapp'

type InvitePageClientProps = {
  invitationCode: string
  guest: Guest
  event: AppEvent
  paymentStatus?: PaymentStatus
  paymentProofUrl?: string | null
  openGate?: string | null
  startTime?: string | null
}

export function InvitePageClient({
  invitationCode,
  guest: initialGuest,
  event,
  paymentStatus,
  paymentProofUrl,
  openGate,
  startTime,
}: InvitePageClientProps) {
  const supabase = createClient()
  const [guest, setGuest] = useState(initialGuest)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentPaymentStatus] = useState(paymentStatus)
  const [currentPaymentProofUrl, setCurrentPaymentProofUrl] = useState(
    paymentProofUrl,
  )
  const [isUpdatingPaymentProof, setIsUpdatingPaymentProof] = useState(false)
  const [isOpen, setIsOpen] = useState(
    initialGuest.guest_type === 'tenant' || initialGuest.guest_type === 'external',
  )
  const [shouldPlayMusic, setShouldPlayMusic] = useState(true)
  const [isTicketView, setIsTicketView] = useState(false)

  useEffect(() => {
    if (isOpen && !isTicketView) {
      setShouldPlayMusic(true)
    } else if (isTicketView) {
      setShouldPlayMusic(false)
    }
  }, [isOpen, isTicketView])

  useEffect(() => {
    document.title = `Undangan ${guest.full_name} - ${event.name}`
  }, [event.name, guest.full_name])

  const handleRSVP = async (status: 'confirmed' | 'declined' | 'pending') => {
    try {
      setIsUpdating(true)

      const res = await fetch(`/api/invite/${encodeURIComponent(invitationCode)}/rsvp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvp_status: status }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan konfirmasi.')
      }

      setGuest((prev) => ({ ...prev, rsvp_status: status }))

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
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan konfirmasi.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePaymentProof = async (file: File) => {
    try {
      setIsUpdatingPaymentProof(true)

      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${invitationCode}-${Date.now()}.${fileExt}`
      const filePath = `payment-proofs/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('event-assets')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('event-assets').getPublicUrl(filePath)

      const res = await fetch(
        `/api/invite/${encodeURIComponent(invitationCode)}/payment-proof`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: event.id,
            payment_proof_url: publicUrl,
          }),
        },
      )

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal memperbarui bukti pembayaran.')
      }

      setCurrentPaymentProofUrl(publicUrl)
      toast.success('Bukti pembayaran berhasil diperbarui.')
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui bukti pembayaran.',
      )
    } finally {
      setIsUpdatingPaymentProof(false)
    }
  }

  if (!guest) {
    return <InvitationStatus type="error" message="Undangan tidak ditemukan." />
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#fafafa] font-sans selection:bg-emerald-100">
      <MosaicBackground
        logoUrl={event.logo_url}
        isFullScreen={true}
        opacity={
          templates.find((template) => template.id === event.template_id)?.config
            .mosaicOpacity ?? 0.1
        }
      />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <TemplateRenderer
            templateId={event.template_id}
            event={event}
            guest={guest}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onRSVP={handleRSVP}
            isUpdating={isUpdating}
            paymentStatus={currentPaymentStatus}
            paymentProofUrl={currentPaymentProofUrl}
            isUpdatingPaymentProof={isUpdatingPaymentProof}
            onUpdatePaymentProof={handleUpdatePaymentProof}
            openGate={openGate}
            startTime={startTime}
            onTicketView={setIsTicketView}
          />
        </AnimatePresence>
      </div>

      {!isTicketView && event.template_id === 'festive-halal' && (
        <FloatingMusicPlayer
          url="https://bbqtqcwjjzzfbyrlehdc.supabase.co/storage/v1/object/public/event-assets/music/lebaran.mp3"
          autoPlay={shouldPlayMusic}
        />
      )}

      <FloatingWhatsApp
        phone="6289676258026"
        containerClassName={
          !isTicketView && event.template_id === 'festive-halal' ? 'right-24' : 'right-6'
        }
      />
    </div>
  )
}
