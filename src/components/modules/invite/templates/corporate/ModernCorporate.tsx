'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Building2, ExternalLink, Loader2, Upload } from 'lucide-react'
import { EventTicket } from '@/components/shared/EventTicket'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatJakartaDate } from '@/lib/utils'
import { Guest, Event as AppEvent } from '@/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Image from 'next/image'

interface TemplateProps {
  event: AppEvent
  guest: Guest
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onRSVP: (status: 'confirmed' | 'declined' | 'pending') => void
  isUpdating: boolean
  paymentStatus?: 'pending' | 'verified' | 'rejected'
  paymentProofUrl?: string | null
  isUpdatingPaymentProof?: boolean
  onUpdatePaymentProof?: (file: File) => Promise<void>
  openGate?: string | null
  startTime?: string | null
  onTicketView?: (visible: boolean) => void
}

export function ModernCorporate({
  event,
  guest,
  isOpen,
  setIsOpen,
  onRSVP,
  isUpdating,
  paymentStatus,
  paymentProofUrl,
  isUpdatingPaymentProof,
  onUpdatePaymentProof,
  openGate,
  startTime,
  onTicketView,
}: TemplateProps) {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !onUpdatePaymentProof) return
    await onUpdatePaymentProof(file)
  }

  const shouldSkipCover =
    guest.guest_type === 'external' || guest.guest_type === 'tenant'

  const showingTicket = guest.rsvp_status === 'confirmed' && isOpen

  useEffect(() => {
    onTicketView?.(showingTicket)
  }, [showingTicket, onTicketView])

  // 1. Confirmed View (Ticket) - Only show if open
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
            entryCode={guest.invitation_code || ''}
            primaryColor="slate"
            logoUrl={event.logo_url || undefined}
            openGate={openGate || undefined}
            guestType={
              guest.guest_type === 'tenant'
                ? 'Booth UMKM'
                : guest.guest_type === 'external'
                  ? 'Umum'
                  : 'Internal'
            }
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

          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-blue-500/10 to-transparent" />
        </div>

        <CardContent className="space-y-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            {[
              {
                label: 'Nama',
                value: guest.full_name || '',
              },
              {
                label: 'Tipe Tamu',
                value:
                  guest.guest_type === 'tenant'
                    ? 'Tenant UMKM'
                    : guest.guest_type === 'external'
                      ? 'Umum'
                      : 'Internal',
              },
              {
                label: 'Tanggal',
                value: formatJakartaDate(event.event_date, 'PPP'),
              },
              {
                label: 'Waktu & Open Gate',
                value:
                  [
                    openGate &&
                      `Gate ${openGate.substring(0, 5).replace(':', '.')}`,
                    startTime &&
                      `Mulai ${startTime.substring(0, 5).replace(':', '.')}`,
                  ]
                    .filter(Boolean)
                    .join(' • ') + ' WIB',
                full: true,
              },
              {
                label: 'Lokasi',
                value: event.location || 'Segera diinfokan',
                full: true,
              },
            ]
              .filter(Boolean)
              .map(
                (
                  item: { label: string; value: string; full?: boolean } | null,
                  id,
                ) =>
                  item && (
                    <div
                      key={id}
                      className={`${item.full ? 'col-span-2' : ''}`}
                    >
                      <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                        {item.label}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ),
              )}
          </div>
          {guest.guest_type === 'tenant' && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTitle className="text-blue-800">
                Informasi Tenant UMKM
              </AlertTitle>

              <AlertDescription className="text-xs leading-relaxed text-blue-700">
                Tenant diharapkan hadir lebih awal untuk persiapan booth.
                <br />
                <span className="font-semibold">
                  Open Gate UMKM: 12:30 WIB – Selesai
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            {guest.guest_type === 'tenant' && paymentStatus === 'pending' ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-fit rounded-full bg-amber-100 p-3">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900 uppercase">
                    Menunggu Verifikasi
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Bukti pembayaran Anda sedang dalam proses verifikasi oleh
                    admin. Tiket akan tersedia setelah pembayaran diverifikasi.
                  </p>
                </div>
                {paymentProofUrl && (
                  <a
                    href={paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-[10px] font-bold text-blue-600 uppercase shadow-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Lihat Bukti Bayar
                  </a>
                )}
                {onUpdatePaymentProof && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isUpdatingPaymentProof}
                    />
                    <span className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-700 uppercase shadow-sm">
                      {isUpdatingPaymentProof ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Update Bukti
                    </span>
                  </label>
                )}
              </div>
            ) : guest.rsvp_status === 'pending' ? (
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
