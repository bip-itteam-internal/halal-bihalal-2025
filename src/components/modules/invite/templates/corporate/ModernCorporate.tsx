'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Building2, ArrowRight } from 'lucide-react'
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
}

export function ModernCorporate({
  event,
  guest,
  isOpen,
  setIsOpen,
  onRSVP,
  isUpdating,
}: TemplateProps) {
  // If tenant or external, we skip the cover
  const isAutoOpen =
    guest.guest_type === 'tenant' || guest.guest_type === 'external'
  const effectOpen = isOpen || isAutoOpen

  // 1. Cover View
  if (!effectOpen) {
    return (
      <motion.div
        key="cover-corp"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
        className="w-full max-w-[400px] p-4"
      >
        <Card
          className="relative aspect-[3/4] overflow-hidden border-none bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-2xl transition-all"
          style={{ borderRadius: '2rem' }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-blue-500 opacity-10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-32 w-32 rounded-full bg-indigo-500 opacity-10 blur-3xl" />

          <CardContent className="flex h-full flex-col items-center justify-between px-6 py-10 text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  {event.logo_url ? (
                    <Image
                      src={event.logo_url}
                      alt="Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-blue-400" />
                  )}
                </div>
              </div>

              <h2 className="text-xs font-bold tracking-[0.4em] text-blue-400 uppercase">
                Official Invitation
              </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="font-sans text-2xl font-black tracking-tight text-white uppercase italic">
                  {event.name}
                </h1>
                <div className="mx-auto h-1 w-12 bg-blue-500" />
                <p className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                  Bharata Internasional Pharmaceutical
                </p>
              </div>

              <div className="space-y-1 py-4">
                <p className="text-[11px] font-medium tracking-widest text-slate-500 uppercase">
                  Kepada Yth.
                </p>
                <p className="text-xl font-bold tracking-tight text-white">
                  {guest.full_name}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsOpen(true)}
              className="group h-14 w-full rounded-xl bg-blue-600 font-bold tracking-widest text-white uppercase shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.02] hover:bg-blue-500"
            >
              Buka Undangan
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // 2. Confirmed View (Ticket)
  if (guest.rsvp_status === 'confirmed') {
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
            eventTime={`${formatJakartaDate(event.event_date, 'p')} WIB`}
            location={event.location || ''}
            guestName={guest.full_name || ''}
            entryCode={guest.invitation_code || guest.id}
            primaryColor="slate"
            logoUrl={event.logo_url || undefined}
            downloadFileName={`Ticket-${guest.full_name}-${event.name}.png`}
          />

          <div className="px-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-12 w-full rounded-xl border-slate-200 bg-white text-[10px] font-bold text-slate-600 uppercase transition-all hover:bg-slate-50"
            >
              Tutup Rincian
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // 3. Information View (Pending/Declined)
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
          <div className="relative z-10">
            <h2 className="text-xl font-black tracking-tight uppercase italic">
              {event.name}
            </h2>
            <p className="text-[9px] font-bold tracking-[0.3em] text-slate-400 uppercase">
              Rincian Acara
            </p>
          </div>
          <Building2 className="relative z-10 h-8 w-8 text-blue-500/50" />

          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-blue-500/10 to-transparent" />
        </div>

        <CardContent className="space-y-8 p-8">
          <div className="space-y-6">
            {[
              {
                icon: Calendar,
                label: 'Tanggal',
                value: formatJakartaDate(event.event_date, 'PPP'),
              },
              {
                icon: Clock,
                label: 'Waktu',
                value: `${formatJakartaDate(event.event_date, 'p')} WIB`,
              },
              {
                icon: MapPin,
                label: 'Lokasi',
                value: event.location || 'Segera diinfokan',
              },
            ].map((item, id) => (
              <div key={id} className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-900">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            {guest.rsvp_status === 'pending' ? (
              <div className="space-y-5 text-center">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Konfirmasi Kehadiran
                  </p>
                  <p className="text-[11px] font-medium text-slate-600">
                    Silakan lakukan konfirmasi kehadiran Anda untuk memudahkan
                    pengaturan logistik acara.
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
                  Terima kasih atas konfirmasinya.
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Kami telah mencatat bahwa Anda berhalangan hadir. Semoga kita
                  dapat berjumpa di agenda perusahaan selanjutnya.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onRSVP('confirmed')}
                  className="text-[10px] font-bold tracking-widest text-blue-600 uppercase"
                >
                  Ubah Menjadi Hadir
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="w-full text-[9px] font-bold tracking-[0.3em] text-slate-400 uppercase hover:bg-transparent hover:text-slate-900"
          >
            Tutup Rincian
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
