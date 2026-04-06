'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { Event as AppEvent, Guest } from '@/types'
import { InvitationStatus } from '@/components/modules/invite/invitation-status'
import { MosaicBackground } from '@/components/modules/invite/mosaic-background'
import { TemplateRenderer } from '@/components/modules/invite/TemplateRenderer'
import { INVITATION_TEMPLATES as templates } from '@/lib/constants/templates'
import { FloatingWhatsApp } from '@/components/ui/floating-whatsapp'
import { toJakartaISOString } from '@/lib/utils'

type InvitePageClientProps = {
  invitationCode: string
  guest: Guest
  event: AppEvent
  openGate?: string | null
  startTime?: string | null
  checkin?: unknown | null
}

export function InvitePageClient({
  invitationCode,
  guest: initialGuest,
  event,
  openGate,
  startTime,
  checkin: initialCheckin,
}: InvitePageClientProps) {
  const [guest, setGuest] = useState(initialGuest)
  const [currentCheckin, setCurrentCheckin] = useState(initialCheckin)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isOpen, setIsOpen] = useState(initialGuest.guest_type === 'external')
  const [isCheckinEnabled, setIsCheckinEnabled] = useState(false)

  useEffect(() => {
    if (!openGate) {
      setIsCheckinEnabled(true)
      return
    }

    const check = () => {
      const gateISO = toJakartaISOString(event.event_date, openGate)
      const gateTime = new Date(gateISO).getTime()
      const now = Date.now()
      // Enabled 1 hour before openGate
      setIsCheckinEnabled(now >= gateTime - 3600000)
    }

    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [event.event_date, openGate])
  useEffect(() => {
    document.title = `Undangan ${guest.full_name} - ${event.name}`
  }, [event.name, guest.full_name])

  const handleRSVP = async (status: 'confirmed' | 'declined' | 'pending') => {
    try {
      setIsUpdating(true)

      const res = await fetch(
        `/api/invite/${encodeURIComponent(invitationCode)}/rsvp`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rsvp_status: status }),
        },
      )

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
      toast.error(
        error instanceof Error ? error.message : 'Gagal menyimpan konfirmasi.',
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSelfCheckin = async () => {
    try {
      setIsUpdating(true)
      const res = await fetch(
        `/api/invite/${encodeURIComponent(invitationCode)}/checkin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: event.id }),
        },
      )

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal melakukan check-in.')
      }

      setCurrentCheckin(data.checkin)

      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#6366f1', '#a5b4fc', '#ffffff'],
      })

      toast.success('Check-in berhasil! Selamat datang di acara.')
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal melakukan check-in.',
      )
    } finally {
      setIsUpdating(false)
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
          templates.find((template) => template.id === event.template_id)
            ?.config.mosaicOpacity ?? 0.1
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
            openGate={openGate}
            startTime={startTime}
            checkin={currentCheckin}
            onSelfCheckin={handleSelfCheckin}
            isCheckinEnabled={isCheckinEnabled}
          />
        </AnimatePresence>
      </div>

      <FloatingWhatsApp phone="6289676258026" />
    </div>
  )
}
