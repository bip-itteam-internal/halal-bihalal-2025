'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { Event as AppEvent, Guest, PaymentStatus, Checkin } from '@/types'
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
  paymentStatus?: PaymentStatus | null
  paymentProofUrl?: string | null
  openGate?: string | null
  openGateHalal?: string | null
  openGateKonser?: string | null
  startTime?: string | null
  checkin?: unknown | null
}

export function InvitePageClient({
  invitationCode,
  guest: initialGuest,
  event,
  openGate,
  openGateHalal,
  openGateKonser,
  startTime,
  checkin: initialCheckin,
}: InvitePageClientProps) {
  const [guest, setGuest] = useState(initialGuest)
  const [currentCheckins, setCurrentCheckins] = useState<Checkin[]>(
    Array.isArray(initialCheckin) ? initialCheckin : []
  )
  const [isUpdating, setIsUpdating] = useState(false)
  const [isOpen, setIsOpen] = useState(initialGuest.guest_type === 'external')
  const [isHalalEnabled, setIsHalalEnabled] = useState(false)
  const [isConcertEnabled, setIsConcertEnabled] = useState(false)

  // Enable Halal Bihalal check-in 30 min before internal open gate
  useEffect(() => {
    if (!openGateHalal) {
      setIsHalalEnabled(true)
      return
    }
    const check = () => {
      const gateISO = toJakartaISOString(event.event_date, openGateHalal)
      const gateTime = new Date(gateISO).getTime()
      setIsHalalEnabled(Date.now() >= gateTime - 1800000) // 30 min
    }
    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [event.event_date, openGateHalal])

  // Enable Konser check-in 30 min before external open gate
  useEffect(() => {
    if (!openGateKonser) {
      setIsConcertEnabled(true)
      return
    }
    const check = () => {
      const gateISO = toJakartaISOString(event.event_date, openGateKonser)
      const gateTime = new Date(gateISO).getTime()
      setIsConcertEnabled(Date.now() >= gateTime - 1800000) // 30 min
    }
    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [event.event_date, openGateKonser])

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

  const handleSelfCheckin = async (step: 'exchange' | 'entrance' = 'exchange') => {
    try {
      setIsUpdating(true)
      const res = await fetch(
        `/api/invite/${encodeURIComponent(invitationCode)}/checkin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: event.id, step }),
        },
      )

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal melakukan check-in.')
      }

      // Add to checkins list
      setCurrentCheckins((prev) => [...prev.filter(c => c.step !== step), data.checkin])

      // After check-in, set guest as confirmed (synced with API background update)
      setGuest((prev) => ({ ...prev, rsvp_status: 'confirmed' }))

      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#6366f1', '#a5b4fc', '#ffffff'],
      })

      toast.success(
        step === 'exchange'
          ? 'Check-in Halal Bihalal berhasil! Selamat datang.'
          : 'Check-in Konser berhasil! Silakan memasuki aula.'
      )
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
            checkins={currentCheckins}
            onSelfCheckinStep={handleSelfCheckin}
            isHalalEnabled={isHalalEnabled}
            isConcertEnabled={isConcertEnabled}
            latitude={event.latitude}
            longitude={event.longitude}
          />
        </AnimatePresence>
      </div>

      <FloatingWhatsApp phone="6289676258026" />
    </div>
  )
}
