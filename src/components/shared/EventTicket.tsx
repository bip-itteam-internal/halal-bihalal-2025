import React, { useRef, useState } from 'react'
import { RefreshCw, Info, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface EventTicketProps {
  eventName: string
  eventDate: string
  eventTime?: string
  location: string
  guestName: string
  statusLabel?: string
  primaryColor?: string
  accentColor?: string
  logoUrl?: string
  className?: string
  openGate?: string
  guestType?: string
  guestAddress?: string | null
  registrationNumber?: number | null
  isAttendanceCheckedIn?: boolean
  checkinTime?: string
  shirtSize?: string | null
  onSelfCheckin?: () => Promise<void>
  isCheckinEnabled?: boolean
}

export function EventTicket({
  eventName,
  eventDate,
  location,
  guestName,
  statusLabel = 'Confirmed',
  className,
  openGate,
  guestType,
  guestAddress,
  registrationNumber,
  isAttendanceCheckedIn,
  shirtSize,
  onSelfCheckin,
  isCheckinEnabled = true,
  logoUrl,
}: EventTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('mx-auto w-full max-w-md px-4', className)}
    >
      <div ref={ticketRef} className="relative overflow-hidden">
        {/* Main Ticket Surface */}
        <div className="relative rounded-[2rem] border border-slate-200 bg-white p-6 ring-1 ring-slate-200">
          <p className="text-sm leading-none font-semibold text-slate-900 uppercase">
            {eventName}
          </p>
          {/* Row 1: Logo & Basic Info */}
          <div className="flex items-start gap-6">
            {logoUrl && (
              <div className="relative h-24 w-24 flex-none overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                <Image
                  src={logoUrl}
                  alt="Event logo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1 space-y-5 pt-1">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Tanggal Acara
                </span>
                <p className="text-sm leading-none font-semibold text-slate-900">
                  {eventDate}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Pukul
                </span>
                <p className="text-sm leading-none font-semibold text-slate-900">
                  {openGate ? `${openGate.substring(0, 5)}` : '12:00'} WIB -
                  Selesai
                </p>
              </div>
              <div className="col-span-2 mt-1 space-y-1.5">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Lokasi
                </span>
                <p className="text-[13px] font-medium text-slate-900">
                  {location}
                </p>
              </div>
              {/* continer untuk open gate umum nya */}
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Open Gate Umum
                </span>
                <p className="text-sm leading-none font-semibold text-slate-900">
                  {openGate ? `${openGate.substring(0, 5)}` : '12:00'} WIB
                </p>
              </div>
            </div>
          </div>

          {/* Perforation Line */}
          <div className="relative -mx-6 my-10 flex items-center justify-center">
            <div className="absolute left-[-13px] h-6 w-6 rounded-full bg-[#fffcf5] ring-1 ring-slate-200" />
            <div className="absolute right-[-13px] h-6 w-6 rounded-full bg-[#fffcf5] ring-1 ring-slate-200" />
            <div className="w-full border-t border-dashed border-slate-300" />
          </div>

          {/* Details Section */}
          <div className="space-y-5">
            <div className="space-y-3 px-1">
              <div className="flex items-start gap-8">
                <div className="flex-1 space-y-1.5">
                  <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                    No. Regis
                  </span>
                  <p className="text-[13px] font-bold text-slate-900">
                    {registrationNumber
                      ? `#${registrationNumber.toString().padStart(3, '0')}`
                      : '-'}
                  </p>
                </div>
                <div className="flex-1 space-y-1.5">
                  <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                    Tipe Tamu
                  </span>
                  <p className="text-[13px] font-bold text-slate-900 uppercase">
                    {guestType || 'INTERNAL'}
                  </p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[11px] font-medium tracking-tight text-slate-500 uppercase">
                  Nama Lengkap
                </span>
                <span className="max-w-[160px] truncate text-right text-[11px] font-semibold text-slate-900 uppercase">
                  {guestName}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[11px] font-medium tracking-tight text-slate-500 uppercase">
                  Ukuran Kaos
                </span>
                <span className="text-[11px] font-semibold text-slate-900 uppercase">
                  {shirtSize || 'N/A'}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[11px] font-medium tracking-tight text-slate-500 uppercase">
                  Instansi
                </span>
                <span className="text-[11px] font-semibold text-slate-900 uppercase">
                  {guestAddress || 'N/A'}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <span className="text-[11px] font-medium tracking-tight text-slate-500 uppercase">
                  Status Kehadiran
                </span>
                <span className="text-[11px] font-bold text-slate-900 uppercase">
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8 px-2">
        {!isAttendanceCheckedIn && onSelfCheckin && (
          <div className="space-y-4">
            <Button
              onClick={async () => {
                if (!isCheckinEnabled) return
                try {
                  setIsCheckingIn(true)
                  await onSelfCheckin()
                } catch (err) {
                  console.error(err)
                } finally {
                  setIsCheckingIn(false)
                }
              }}
              disabled={isCheckingIn || !isCheckinEnabled}
              className={cn(
                'h-16 w-full rounded-2xl text-[11px] font-bold tracking-[0.2em] text-white uppercase transition-all active:scale-[0.98]',
                isCheckinEnabled
                  ? 'bg-halal-primary shadow-[0_20px_40px_-12px_rgba(245,158,11,0.4)] hover:opacity-90'
                  : 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none'
              )}
            >
              {isCheckingIn ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <User className="mr-3 h-4 w-4" />
              )}
              {isCheckingIn ? 'MEMPROSES...' : 'CHECK-IN SEKARANG'}
            </Button>
            
            {!isCheckinEnabled && (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 ring-1 ring-slate-100">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-[10px] font-bold tracking-tight text-slate-500 uppercase">
                  Tombol aktif 1 jam sebelum pintu dibuka
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </motion.div>
  )
}
