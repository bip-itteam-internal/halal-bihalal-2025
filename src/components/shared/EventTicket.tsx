import React, { useRef, useState } from 'react'
import { RefreshCw, Info, User, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { cn, getHaversineDistance } from '@/lib/utils'
import { toast } from 'sonner'

export interface EventTicketProps {
  eventName: string
  eventDate: string
  eventTime?: string
  guestName: string
  statusLabel?: string
  primaryColor?: string
  accentColor?: string
  className?: string
  guestType?: string
  guestAddress?: string | null
  registrationNumber?: number | null
  isHalalCheckedIn?: boolean
  isConcertCheckedIn?: boolean
  checkinTime?: string
  shirtSize?: string | null
  openGateHalal?: string | null
  openGateKonser?: string | null
  onSelfCheckinStep?: (step: 'exchange' | 'entrance') => Promise<void>
  isHalalEnabled?: boolean
  isConcertEnabled?: boolean
  latitude?: number | null
  longitude?: number | null
}

export function EventTicket({
  eventName,
  eventDate,
  guestName,
  statusLabel = 'Confirmed',
  className,
  guestAddress,
  registrationNumber,
  isHalalCheckedIn,
  isConcertCheckedIn,
  shirtSize,
  openGateHalal,
  openGateKonser,
  onSelfCheckinStep,
  isHalalEnabled = false,
  isConcertEnabled = false,
  latitude,
  longitude,
}: EventTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null)
  const [isCheckingIn, setIsCheckingIn] = useState<
    'exchange' | 'entrance' | null
  >(null)

  let statusBg = 'bg-slate-50 ring-slate-200'
  let statusText = 'text-slate-600'

  if (statusLabel.toLowerCase() === 'confirmed') {
    statusBg = 'bg-emerald-50 ring-emerald-100'
    statusText = 'text-emerald-600'
  } else if (statusLabel.toLowerCase() === 'pending') {
    statusBg = 'bg-amber-50 ring-amber-200'
    statusText = 'text-amber-600'
  } else if (statusLabel.toLowerCase() === 'declined') {
    statusBg = 'bg-red-50 ring-red-100'
    statusText = 'text-red-600'
  }

  const renderCheckInButton = (
    step: 'exchange' | 'entrance',
    label: string,
    isCheckedIn: boolean,
    isEnabled: boolean,
    icon: React.ReactNode,
  ) => {
    if (isCheckedIn) {
      return (
        <div className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-50 py-4 ring-1 ring-emerald-200">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-[11px] font-bold tracking-widest text-emerald-700 uppercase">
            {label} BERHASIL CHECK-IN
          </p>
        </div>
      )
    }

    return (
      <Button
        onClick={async () => {
          if (!isEnabled || isCheckingIn) return
          
          try {
            setIsCheckingIn(step)

            // Geofencing Check
            if (latitude && longitude) {
              const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 5000,
                  maximumAge: 0,
                })
              }).catch(() => null)

              if (!pos) {
                toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.')
                setIsCheckingIn(null)
                return
              }

              const distance = getHaversineDistance(
                pos.coords.latitude,
                pos.coords.longitude,
                latitude,
                longitude
              )

              if (distance > 50) {
                toast.error(`Anda berada di luar jangkauan lokasi acara (Jarak: ${Math.round(distance)}m). Radius maksimal 50m.`, {
                  duration: 5000,
                })
                setIsCheckingIn(null)
                return
              }
            }

            await onSelfCheckinStep?.(step)
          } catch (err) {
            console.error(err)
            toast.error('Terjadi kesalahan saat proses check-in.')
          } finally {
            setIsCheckingIn(null)
          }
        }}
        disabled={isCheckingIn !== null || !isEnabled}
        className={cn(
          'h-16 w-full rounded-2xl text-[11px] font-bold tracking-[0.2em] text-white uppercase transition-all active:scale-[0.98]',
          isEnabled
            ? 'bg-slate-900 shadow-xl hover:opacity-90'
            : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none',
        )}
      >
        {isCheckingIn === step ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : (
          icon
        )}
        {isCheckingIn === step ? 'MEMPROSES...' : `CHECK-IN ${label}`}
      </Button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('mx-auto w-full max-w-md px-4', className)}
    >
      <div ref={ticketRef} className="relative overflow-hidden">
        {/* Main Ticket Surface */}
        <div className="relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <p className="mb-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Tiket Digital
          </p>
          <div className="space-y-4">
            <h3 className="text-xl leading-tight font-black text-slate-900 uppercase">
              {eventName}
            </h3>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                No. Registrasi
              </span>
              <p className="text-3xl font-black tracking-tight text-slate-900">
                {registrationNumber
                  ? `${registrationNumber.toString().padStart(3, '0')}`
                  : '-'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                Nama Lengkap
              </span>
              <p className="text-lg font-black text-slate-900 uppercase">
                {guestName}
              </p>
            </div>

            {guestAddress && (
              <div className="space-y-1">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Instansi
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {guestAddress}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Tanggal
                </span>
                <p className="text-xs leading-none font-bold text-slate-900">
                  {eventDate}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Ukuran Kaos
                </span>
                <p className="text-xs leading-none font-bold text-slate-900">
                  {shirtSize || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                Lokasi
              </span>
              <p className="text-xs leading-tight font-bold text-slate-900">
                Lap. Parkir PT. Bharata Internasional Pharmaceutical
              </p>
            </div>

            {(openGateHalal || openGateKonser) && (
              <div className="grid grid-cols-2 gap-8">
                {openGateHalal && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                      Gate Halal Bihalal
                    </span>
                    <p className="text-xs leading-none font-bold text-slate-900 tabular-nums">
                      {openGateHalal.substring(0, 5).replace(':', '.')} WIB
                    </p>
                  </div>
                )}
                {openGateKonser && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                      Gate Konser
                    </span>
                    <p className="text-xs leading-none font-bold text-slate-900 tabular-nums">
                      {openGateKonser.substring(0, 5).replace(':', '.')} WIB
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Perforation Line */}
          <div className="relative -mx-6 my-10 flex items-center justify-center">
            <div className="absolute left-[-13px] h-6 w-6 rounded-full bg-[#fafafa] ring-1 ring-slate-200" />
            <div className="absolute right-[-13px] h-6 w-6 rounded-full bg-[#fafafa] ring-1 ring-slate-200" />
            <div className="w-full border-t border-dashed border-slate-300" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Status Kehadiran
              </span>
              <div
                className={`flex h-5 items-center rounded-full px-3 ring-1 ${statusBg}`}
              >
                <p
                  className={`text-[9px] font-bold uppercase tabular-nums ${statusText}`}
                >
                  {statusLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Check-in Buttons */}
          <div className="mt-8 space-y-3">
            {(isHalalCheckedIn || isHalalEnabled) &&
              renderCheckInButton(
                'exchange',
                'HALAL BIHALAL',
                !!isHalalCheckedIn,
                isHalalEnabled,
                <User className="mr-3 h-4 w-4" />,
              )}

            {(isConcertCheckedIn || isConcertEnabled) &&
              renderCheckInButton(
                'entrance',
                'KONSER CHARLY',
                !!isConcertCheckedIn,
                isConcertEnabled,
                <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900">
                  <RefreshCw className="h-3 w-3" />
                </div>,
              )}

            {!(isHalalCheckedIn || isHalalEnabled) &&
              !(isConcertCheckedIn || isConcertEnabled) && (
                <div className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 ring-1 ring-slate-100">
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-[10px] font-bold tracking-tight text-slate-500 uppercase">
                    Tombol check-in akan muncul saat gate dibuka
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
