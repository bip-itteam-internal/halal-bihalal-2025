'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
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
  checkin?: unknown | null
  onSelfCheckin?: () => Promise<void>
  isCheckinEnabled?: boolean
}

export function ModernCorporate({
  event,
  guest,
  isOpen,
  setIsOpen,
  onRSVP,
  isUpdating,
  openGate,
  startTime,
  onTicketView,
  checkin,
  onSelfCheckin,
  isCheckinEnabled,
}: TemplateProps) {
  const shouldSkipCover = guest.guest_type === 'external'
  const showingTicket = guest.rsvp_status === 'confirmed' && isOpen

  useEffect(() => {
    onTicketView?.(showingTicket)
  }, [showingTicket, onTicketView])

  if (guest.rsvp_status === 'confirmed' && isOpen) {
    return (
      <motion.div
        key="ticket-view-corp"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] p-4"
      >
        <div className="space-y-6">
          <EventTicket
            eventName={event.name}
            eventDate={formatJakartaDate(event.event_date, 'PPP')}
            location={event.location || ''}
            guestName={guest.full_name || ''}
            guestAddress={guest.address || null}
            registrationNumber={
              guest.guest_events?.find((ge) => ge.event_id === event.id)
                ?.registration_number
            }
            primaryColor="slate"
            logoUrl={event.logo_url || undefined}
            openGate={openGate || undefined}
            guestType={guest.guest_type === 'external' ? 'Umum' : 'Internal'}
            eventTime={
              startTime
                ? startTime.substring(0, 5).replace(':', '.') + ' WIB'
                : formatJakartaDate(event.event_date, 'p')
            }
            isAttendanceCheckedIn={!!checkin}
            checkinTime={(checkin as { checkin_time: string })?.checkin_time}
            shirtSize={guest.shirt_size}
            onSelfCheckin={onSelfCheckin}
            isCheckinEnabled={isCheckinEnabled}
          />

          {!shouldSkipCover && (
            <div className="px-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-12 w-full rounded-xl border-slate-200 bg-white text-[10px] font-bold text-slate-600 uppercase transition-all hover:bg-slate-50"
              >
                Tutup Rincian
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="content-corp"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      className="m-6 w-full max-w-md"
    >
      <Card
        className="overflow-hidden border-none bg-white p-0 shadow-2xl"
        style={{ borderRadius: '1.5rem' }}
      >
        <div className="relative flex h-32 items-center justify-between overflow-hidden bg-slate-900 px-8 text-white">
          {event.logo_url ? (
            <div className="relative z-10 h-16 w-full max-w-[220px]">
              <Image
                src={event.logo_url}
                alt={event.name || 'Event logo'}
                fill
                sizes="220px"
                className="object-contain object-left"
                priority
              />
            </div>
          ) : (
            <>
              <div className="relative z-10">
                <h2 className="text-xl font-black tracking-tight uppercase italic">
                  {event.name}
                </h2>
              </div>
              <Building2 className="relative z-10 h-8 w-8 text-blue-500/50" />
            </>
          )}

          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-blue-500/10 to-transparent" />
        </div>

        <CardContent className="space-y-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            <div>
              <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                Nama
              </p>
              <p className="text-sm font-bold text-slate-900">
                {guest.full_name || ''}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                Tipe Tamu
              </p>
              <p className="text-sm font-bold text-slate-900">
                {guest.guest_type === 'external' ? 'Umum' : 'Internal'}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                Tanggal
              </p>
              <p className="text-sm font-bold text-slate-900">
                {formatJakartaDate(event.event_date, 'PPP')}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                Waktu & Open Gate
              </p>
              <p className="text-sm font-bold text-slate-900">
                {[
                  openGate &&
                    `Gate ${openGate.substring(0, 5).replace(':', '.')}`,
                  startTime &&
                    `Mulai ${startTime.substring(0, 5).replace(':', '.')}`,
                ]
                  .filter(Boolean)
                  .join(' • ') + ' WIB'}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                Lokasi
              </p>
              <p className="text-sm font-bold text-slate-900">
                {event.location || 'Segera diinfokan'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            {guest.rsvp_status === 'pending' ? (
              <div className="space-y-5 text-center">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Konfirmasi Kehadiran
                  </p>
                  <p className="text-[11px] leading-relaxed font-medium text-slate-600">
                    Besar harapan kami agar kamu bisa hadir dan berbagi
                    kebahagiaan di momen spesial perusahaan kali ini.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => onRSVP('confirmed')}
                    disabled={isUpdating}
                    className="h-12 w-full rounded-xl bg-slate-900 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-slate-800"
                  >
                    Konfirmasi Hadir
                  </Button>
                  <Button
                    onClick={() => onRSVP('declined')}
                    variant="outline"
                    className="h-12 w-full rounded-xl border-slate-200 text-[10px] font-bold tracking-widest text-slate-600 uppercase hover:bg-slate-50"
                  >
                    Berhalangan Hadir
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-4 text-center">
                <p className="text-sm font-bold tracking-tight text-slate-900 uppercase">
                  {guest.rsvp_status === 'confirmed' ? 'Terima kasih atas konfirmasinya' : 'Anda berhalangan hadir'}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  {guest.rsvp_status === 'confirmed'
                    ? 'Sampai jumpa di lokasi acara!'
                    : 'Kami telah mencatat bahwa Anda berhalangan hadir. Semoga kita dapat berjumpa di agenda perusahaan selanjutnya.'}
                </p>
                {guest.rsvp_status === 'declined' && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => onRSVP('confirmed')}
                    className="text-[10px] font-bold tracking-widest text-blue-600 uppercase"
                  >
                    Ubah Menjadi Hadir
                  </Button>
                )}
              </div>
            )}
          </div>

          {!shouldSkipCover && (
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="w-full text-[9px] font-bold tracking-[0.3em] text-slate-400 uppercase hover:bg-transparent hover:text-slate-900"
            >
              Tutup Rincian
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
