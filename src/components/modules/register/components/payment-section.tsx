import React from 'react'
import { Info, MessageCircle, CheckCircle2, Upload } from 'lucide-react'
import { Event } from '@/types'
import { cn } from '@/lib/utils'

interface PaymentSectionProps {
  registrationType: 'external' | 'tenant'
  eventData: Event | null
  price: number
  paymentFile: File | null
  setPaymentFile: (file: File | null) => void
}

export function PaymentSection({
  registrationType,
  eventData,
  price,
  paymentFile,
  setPaymentFile,
}: PaymentSectionProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-2xl backdrop-blur-sm">
      {/* Price / Type Header */}
      <div className="flex items-center justify-between border-b border-amber-500/10 p-5">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[10px] font-black tracking-widest text-amber-500 uppercase">
              {registrationType === 'tenant' ? 'Booth UMKM' : 'Tamu Umum'}
            </p>
            <h4 className="text-sm font-bold text-white">Biaya Pendaftaran</h4>
          </div>
        </div>

        <div className="text-right">
          {registrationType === 'tenant' ? (
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-xs font-bold text-amber-500 italic">
                Hubungi Panitia
              </span>
              <a
                href={`https://wa.me/6289676258026?text=Halo%20Admin,%20saya%20PIC%20Tenant%20tertarik%20mendaftar%20untuk%20event%20${eventData?.name || 'ini'}.%20Mohon%20info%20lebih%20lanjut.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-black tracking-tight text-white transition-transform hover:scale-105 active:scale-95"
              >
                <MessageCircle className="h-3 w-3 fill-current" /> WhatsApp
                (Fariz)
              </a>
            </div>
          ) : (
            <p className="text-xl font-black tracking-tighter text-white">
              Rp {price.toLocaleString('id-ID')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6 p-5">
        {/* Bank Transfer Info */}
        {eventData?.payment_info && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-amber-500/80 uppercase">
              <div className="h-1 w-1 rounded-full bg-amber-500" />
              Metode Transfer
            </div>
            <div className="relative rounded-xl bg-black/40 p-4 ring-1 ring-white/5">
              <Info className="absolute top-4 right-4 h-3.5 w-3.5 text-amber-500/20" />
              <p className="font-mono text-[11px] leading-relaxed text-slate-300">
                {eventData?.payment_info}
              </p>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-amber-500/80 uppercase">
              <div className="h-1 w-1 rounded-full bg-amber-500" />
              Bukti Transfer
            </div>
            {paymentFile && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase">
                <CheckCircle2 className="h-3 w-3" /> Terpilih
              </span>
            )}
          </div>

          <div
            className={cn(
              'group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-8 transition-all',
              paymentFile
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-white/10 bg-black/20 hover:border-amber-500/30 hover:bg-black/40',
            )}
            onClick={() => document.getElementById('payment-upload')?.click()}
          >
            <input
              id="payment-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setPaymentFile(file)
              }}
            />

            {paymentFile ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="max-w-[200px] truncate text-xs font-bold text-emerald-500">
                    {paymentFile.name}
                  </p>
                  <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase opacity-50">
                    Klik untuk ganti
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-zinc-500 transition-colors group-hover:bg-amber-500/10 group-hover:text-amber-500">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-400 group-hover:text-amber-500">
                    Upload Bukti Pembayaran
                  </p>
                  <p className="text-[9px] font-black tracking-widest text-zinc-600 uppercase">
                    JPG, PNG • MAX 2MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
