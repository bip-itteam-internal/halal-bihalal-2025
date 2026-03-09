import React, { useRef, useState } from 'react'
import { Download, RefreshCw, Info } from 'lucide-react'
import QRCode from 'react-qr-code'
import { toPng } from 'html-to-image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface EventTicketProps {
  eventName: string
  eventDate: string
  eventTime?: string
  location: string
  guestName: string
  entryCode: string
  statusLabel?: string
  primaryColor?: string
  accentColor?: string
  logoUrl?: string
  className?: string
  showDownloadButton?: boolean
  downloadFileName?: string
  openGate?: string
  guestType?: string
}

export function EventTicket({
  eventName,
  eventDate,
  eventTime,
  location,
  guestName,
  entryCode,
  statusLabel = 'Confirmed',
  primaryColor = 'emerald',
  className,
  showDownloadButton = true,
  downloadFileName,
  openGate,
  guestType,
}: EventTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(true)

  // Color mapping for dynamic themes
  const colorMap: Record<
    string,
    { bg: string; text: string; ring: string; light: string }
  > = {
    emerald: {
      bg: 'bg-emerald-900',
      text: 'text-emerald-900',
      ring: 'ring-emerald-500/20',
      light: 'bg-emerald-50',
    },
    slate: {
      bg: 'bg-slate-900',
      text: 'text-slate-900',
      ring: 'ring-slate-500/20',
      light: 'bg-slate-50',
    },
    blue: {
      bg: 'bg-blue-900',
      text: 'text-blue-900',
      ring: 'ring-blue-500/20',
      light: 'bg-blue-50',
    },
    indigo: {
      bg: 'bg-indigo-900',
      text: 'text-indigo-900',
      ring: 'ring-indigo-500/20',
      light: 'bg-indigo-50',
    },
  }

  const colors = colorMap[primaryColor] || colorMap.emerald

  const handleDownload = async () => {
    if (!ticketRef.current) return

    try {
      setIsDownloading(true)
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: 'transparent',
        pixelRatio: 3,
      })

      const link = document.createElement('a')
      link.download = downloadFileName || `Ticket-${guestName}-${eventName}.png`
      link.href = dataUrl
      link.click()
      toast.success('Tiket berhasil diunduh!')
    } catch (err) {
      console.error(err)
      toast.error('Gagal mengunduh tiket.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className={cn('relative space-y-6', className)}>
      {/* The Physical Ticket */}
      <div
        ref={ticketRef}
        className="relative flex flex-col"
        style={{
          filter:
            'drop-shadow(0 20px 25px rgba(0,0,0,0.1)) drop-shadow(0 0 1px rgba(226,232,240,1))',
        }}
      >
        {/* Top Part */}
        <div className="rounded-t-[2.5rem] bg-white p-8 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Event
              </p>
              <p className="max-w-[300px] text-lg leading-tight font-bold">
                {eventName}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Status
              </p>
              <div
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1',
                  colors.light,
                )}
              >
                <div
                  className={cn(
                    'mr-2 h-1.5 w-1.5 animate-pulse rounded-full',
                    colors.bg.replace('bg-', 'bg-'),
                  )}
                  style={{
                    backgroundColor: colors.bg.includes('emerald')
                      ? '#10b981'
                      : undefined,
                  }}
                />
                <p
                  className={cn(
                    'text-[10px] font-bold uppercase',
                    colors.text.replace('text-', 'text-'),
                  )}
                  style={{
                    color: colors.text.includes('emerald')
                      ? '#047857'
                      : undefined,
                  }}
                >
                  {statusLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Middle Section: Event Details */}
          <div className="mt-6 space-y-4 border-t border-dashed border-slate-100 pt-6">
            {/* Full Date - Large & Prominent */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                Hari & Tanggal
              </p>
              <p className="text-[16px] leading-tight font-bold text-slate-900">
                {eventDate}
              </p>
            </div>

            {/* Time Grid (Open Gate & Start Time) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Open Gate
                </p>
                <p className="text-[11px] leading-tight font-bold text-slate-900">
                  {openGate
                    ? openGate.substring(0, 5).replace(':', '.') + ' WIB'
                    : '-'}
                </p>
              </div>

              <div className="space-y-1 text-right">
                <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Waktu Mulai
                </p>
                <p className="text-[11px] leading-tight font-bold text-slate-900">
                  {eventTime} - Selesai
                </p>
              </div>
            </div>

            {/* Info Grid (Location & Category) */}
            <div className="grid grid-cols-2 gap-x-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Lokasi
                </p>
                <p className="text-[11px] leading-tight font-bold text-slate-900">
                  {location}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Kategori
                </p>
                <p className="text-[11px] font-black tracking-wider uppercase">
                  {guestType || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Guest Info */}
          <div className="mt-8 grid grid-cols-2 gap-x-4 border-t border-dashed border-slate-100 pt-6">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Nama Tamu
              </p>
              <p className="text-xl leading-tight font-black tracking-tight text-slate-900">
                {guestName}
              </p>
            </div>
          </div>
        </div>

        {/* Perforation (Real Cutout) */}
        <div
          className="relative flex h-8 w-full items-center"
          style={{
            backgroundImage: `radial-gradient(circle at 0px 50%, transparent 10px, white 10.5px), radial-gradient(circle at 100% 50%, transparent 10px, white 10.5px)`,
            backgroundSize: '51% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left center, right center',
          }}
        >
          <div className="mx-8 flex-1 border-t-2 border-dashed border-slate-200" />
        </div>

        {/* Bottom Part (QR Section) */}
        <div className="flex flex-col items-center rounded-b-[2.5rem] bg-white p-8 pt-6">
          <div className="rounded-[1rem] bg-white p-6 shadow-xl ring-1 ring-slate-100">
            <QRCode
              value={entryCode}
              size={250}
              fgColor="#0f172a"
              bgColor="#ffffff"
              level="H"
            />
          </div>
          <div className="mt-6 flex flex-col items-center gap-1">
            <p className="font-mono text-2xl font-black tracking-[0.4em] text-slate-900">
              {entryCode}
            </p>
          </div>
          <div className="mt-6 flex flex-col items-center gap-1">
            <p className="text-xs text-slate-900">
              Tunjukkan QR ini kepada petugas
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showDownloadButton && (
        <div className="px-2">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className={cn(
              'h-14 w-full rounded-2xl bg-[#0c2526] text-xs font-bold tracking-widest text-white uppercase shadow-xl transition-all active:scale-95',
            )}
          >
            {isDownloading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Unduh Tiket Masuk
          </Button>
        </div>
      )}

      {/* Info Reminder Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent
          className="w-11/12 max-w-sm rounded-[2rem] p-6 text-center shadow-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full">
              <Info className="h-8 w-8" />
            </div>
            <DialogTitle className={cn('text-xl font-bold')}>
              Informasi E-Ticket
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-slate-600">
              Ini adalah e-ticket resmi untuk kehadiran dan penukaran gelang di
              lokasi acara.
              <br />
              <br />
              <span className="font-semibold text-slate-800">
                Penting:
              </span>{' '}
              Simpan tiket ini baik-baik. Anda bisa mengunduhnya sebagai gambar.
              Tunjukkan kode bar pada tiket ini kepada petugas di lokasi acara.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowInfoModal(false)}>Saya Mengerti</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
