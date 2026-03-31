'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  ArrowRight,
  LucideIcon,
} from 'lucide-react'
import { EventTicket } from '@/components/shared/EventTicket'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatJakartaDate } from '@/lib/utils'
import { Guest, Event as AppEvent } from '@/types'
import Image from 'next/image'

interface TemplateProps {
  event: AppEvent
  guest: Guest
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onRSVP: (status: 'confirmed' | 'declined' | 'pending') => void
  isUpdating: boolean
  openGate?: string | null
  startTime?: string | null
  onTicketView?: (visible: boolean) => void
}

function InfoItem({
  icon: Icon,
  label,
  value,
  isTight,
}: {
  icon: LucideIcon
  label: string
  value: string
  isTight?: boolean
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold tracking-widest text-amber-700/60 uppercase">
          {label}
        </p>
        <p
          className={`text-sm font-bold text-slate-800 ${isTight ? 'leading-tight' : ''}`}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

function HalalEventInfo({
  event,
  openGate,
  startTime,
}: {
  event: AppEvent
  openGate?: string | null
  startTime?: string | null
}) {
  return (
    <div className="space-y-6">
      <InfoItem
        icon={Calendar}
        label="Hari & Tanggal"
        value={formatJakartaDate(event.event_date, 'PPPP')}
      />

      {(openGate || startTime) && (
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex flex-1 gap-4">
            {openGate && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-amber-700/60 uppercase">
                  Open Gate
                </p>
                <p className="text-sm font-bold text-slate-800 tabular-nums">
                  {openGate.substring(0, 5).replace(':', '.')} WIB
                </p>
              </div>
            )}
            {startTime && (
              <div
                className={`space-y-1 ${openGate ? 'border-l border-amber-100 pl-4' : ''}`}
              >
                <p className="text-[10px] font-bold tracking-widest text-amber-700/60 uppercase">
                  Waktu Mulai
                </p>
                <p className="text-sm font-bold text-slate-800 tabular-nums">
                  {startTime.substring(0, 5).replace(':', '.')} WIB
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <InfoItem
        icon={MapPin}
        label="Lokasi Acara"
        value={event.location || 'Lokasi menyusul'}
        isTight
      />
    </div>
  )
}

export function TraditionalHalal({
  event,
  guest,
  isOpen,
  setIsOpen,
  onRSVP,
  isUpdating,
  openGate,
  startTime,
  onTicketView,
}: TemplateProps) {
  const shouldSkipCover = guest.guest_type === 'external'
  const showingTicket = guest.rsvp_status === 'confirmed' && isOpen

  useEffect(() => {
    onTicketView?.(showingTicket)
  }, [showingTicket, onTicketView])

  if (showingTicket) {
    return (
      <motion.div
        key="ticket-view-halal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] p-4"
      >
        <div className="space-y-6">
          <EventTicket
            eventName={event.name}
            eventDate={formatJakartaDate(event.event_date, 'PPPP')}
            location={event.location || ''}
            guestName={guest.full_name || ''}
            entryCode={guest.invitation_code || ''}
            primaryColor="emerald"
            logoUrl={event.logo_url || undefined}
            openGate={openGate || undefined}
            guestType={guest.guest_type === 'external' ? 'Umum' : 'Internal'}
            eventTime={
              startTime
                ? startTime.substring(0, 5).replace(':', '.') + ' WIB'
                : formatJakartaDate(event.event_date, 'p')
            }
            downloadFileName={`Ticket-${guest.full_name}-${event.name}.png`}
          />

          {!shouldSkipCover && (
            <div className="px-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-12 w-full rounded-2xl border-slate-200 bg-white text-[10px] font-bold text-slate-600 uppercase transition-all hover:bg-slate-50"
              >
                Tutup Rincian
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (!isOpen && !shouldSkipCover) {
    return (
      <motion.div
        key="cover-halal"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] p-4"
      >
        <Card
          className="relative aspect-[3/4] overflow-hidden border-none bg-gradient-to-b from-[#083336] via-[#0a2c2f] to-[#062023] text-white shadow-2xl transition-all"
          style={{ borderRadius: '3rem' }}
        >
          <CardContent className="flex h-full flex-col items-center justify-between px-6 py-8 text-center">
            <div className="space-y-8">
              <div className="flex justify-center">
                <Image
                  src="/logo/LOGO%20A.png"
                  alt="Logo"
                  width={160}
                  height={96}
                  className="object-contain"
                />
              </div>
              <h2 className="font-serif text-lg tracking-widest text-amber-100 uppercase">
                Undangan
              </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="font-serif text-2xl leading-tight font-bold text-amber-50">
                  {event.name}
                </h1>
                <div className="mx-auto h-px w-12 bg-amber-400/30" />
                <p className="text-sm text-amber-100/90">
                  PT Bharata Internasional Pharmaceutical
                </p>
              </div>
              <div className="space-y-1 py-4">
                <p className="text-[11px] text-amber-200 italic">
                  Spesial Untuk:
                </p>
                <p className="text-xl font-bold tracking-tight text-white uppercase">
                  {guest.full_name}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 font-black tracking-widest text-[#0a2c2f] uppercase shadow-[0_10px_30px_rgba(251,191,36,0.3)] transition-all hover:scale-[1.03] hover:from-amber-200 hover:to-amber-400"
            >
              Buka Undangan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="content-halal"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-5 my-6 w-[calc(100%-2.5rem)] max-w-md md:mx-auto"
    >
      <Card
        className="overflow-hidden border-none bg-white p-0 shadow-2xl"
        style={{ borderRadius: '2.5rem' }}
      >
        <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-r from-[#0a2f33] via-[#0f3a3f] to-[#0a2f33] px-8">
          {event.logo_url ? (
            <div className="relative z-10 h-20 w-full max-w-[260px]">
              <Image
                src={event.logo_url}
                alt={event.name || 'Event logo'}
                fill
                sizes="260px"
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <h2 className="relative z-10 max-w-md text-center font-serif text-2xl font-bold tracking-tight text-amber-200 uppercase">
              {event.name}
            </h2>
          )}
        </div>

        <CardContent className="space-y-8 pt-6 pb-6">
          <HalalEventInfo
            event={event}
            openGate={openGate}
            startTime={startTime}
          />

          <div className="rounded-3xl border border-amber-200 bg-[#0b2d30] p-6 shadow-inner">
            <div className="space-y-4 text-center">
              {guest.rsvp_status === 'pending' ? (
                <>
                  <Heart className="mx-auto h-8 w-8 text-amber-300" />
                  <p className="mx-auto max-w-md px-4 text-xs leading-relaxed font-medium text-amber-50">
                    Jadilah bagian dari momen berharga ini. Kehadiranmu sangat kami
                    harapkan untuk melengkapi kebersamaan kita.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onRSVP('confirmed')}
                      disabled={isUpdating}
                      className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-amber-300 to-amber-500 text-[10px] font-bold text-[#0a2c2f] uppercase hover:from-amber-200 hover:to-amber-400"
                    >
                      Siap Hadir
                    </Button>
                    <Button
                      onClick={() => onRSVP('declined')}
                      variant="outline"
                      className="h-12 flex-1 rounded-2xl border-amber-200 bg-transparent text-[10px] font-bold text-amber-100 uppercase hover:bg-amber-200/10"
                    >
                      Tidak Bisa Hadir
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 py-2 text-center">
                  <p className="text-sm font-bold text-amber-100">
                    Terima kasih atas konfirmasinya.
                  </p>
                  <p className="text-xs text-amber-100/70">
                    {guest.rsvp_status === 'confirmed'
                      ? 'Kami sangat menantikan kehadiranmu!'
                      : 'Semoga kita dapat bersilaturahmi di lain kesempatan.'}
                  </p>
                  {guest.rsvp_status === 'declined' && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onRSVP('confirmed')}
                      className="text-[10px] text-amber-300 underline"
                    >
                      Ubah Jadi Hadir?
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {!shouldSkipCover && (
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="mb-2 w-full text-[10px] font-bold tracking-[0.3em] text-amber-700/60 uppercase hover:bg-transparent hover:text-amber-800"
            >
              Tutup Rincian
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
