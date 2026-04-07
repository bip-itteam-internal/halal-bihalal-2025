'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Mail, Loader2, AlertCircle, Clock, ShieldCheck, User } from 'lucide-react'
import { sendSingleEmailAction } from '@/app/actions/email-actions'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface EmailBulkDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  isAllMode?: boolean
  totalCount?: number
  searchFilter?: string
  eventId?: string
  guestType?: string
  statusFilter?: string
  payStatus?: string
  onSuccess?: (updatedIds: string[]) => void
  defaultProvider?: 'resend' | 'gmail'
}

export function EmailBulkDialog({
  isOpen,
  onOpenChange,
  selectedIds,
  isAllMode = false,
  totalCount = 0,
  searchFilter = '',
  eventId = '',
  guestType = 'all',
  statusFilter = 'all',
  payStatus = 'all',
  onSuccess,
  defaultProvider = 'resend',
}: EmailBulkDialogProps) {
  const [provider, setProvider] = useState<'resend' | 'gmail'>(defaultProvider)

  useEffect(() => {
    if (isOpen) {
      setProvider(defaultProvider)
    }
  }, [isOpen, defaultProvider])
  const [isSending, setIsSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalToSend, setTotalToSend] = useState(0)
  const [nextSendAt, setNextSendAt] = useState<number | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState(0)

  const [results, setResults] = useState<
    { id: string; name: string; success: boolean; message: string }[]
  >([])

  // Timer for countdown
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (nextSendAt && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [nextSendAt, secondsRemaining])

  const handleSend = async () => {
    try {
      setIsSending(true)
      setStatus('sending')
      setProgress(0)
      setResults([])

      let targets: { id: string; name: string }[] = []

      if (isAllMode && eventId) {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        let query = supabase
          .from('guest_events')
          .select('guest_id, guests!inner(full_name, email)')
          .eq('event_id', eventId)
          .not('guests.email', 'is', null)
          .neq('guests.email', '')

        if (searchFilter) {
          query = query.or(
            `full_name.ilike.%${searchFilter}%,address.ilike.%${searchFilter}%`,
            { foreignTable: 'guests' },
          )
        }

        if (guestType !== 'all') {
          query = query.eq('guests.guest_type', guestType)
        }

        if (statusFilter !== 'all') {
          query = query.eq('guests.rsvp_status', statusFilter)
        }

        if (payStatus !== 'all') {
          query = query.eq('payment_status', payStatus)
        }

        const { data, error } = await query.limit(5000)
        if (error) throw error
        
        targets = (data || []).map((g: any) => ({
          id: g.guest_id,
          name: g.guests.full_name || 'Tamu Tanpa Nama'
        }))
      } else {
        targets = selectedIds.map(id => ({ id, name: `ID: ${id.slice(0, 8)}` }))
      }

      if (targets.length === 0) {
        toast.error('Tidak ada tamu yang memenuhi kriteria pengiriman email.')
        setStatus('idle')
        setIsSending(false)
        return
      }

      setTotalToSend(targets.length)
      const batchResults: typeof results = []

      for (let i = 0; i < targets.length; i++) {
        setCurrentIndex(i + 1)
        const target = targets[i]

        // 1. Send call passing the chosen provider
        const res = await sendSingleEmailAction(target.id, provider)

        batchResults.push({
          id: target.id,
          name: target.name,
          success: res.success,
          message: res.message || (res.success ? 'Berhasil' : 'Gagal'),
        })
        setResults([...batchResults])

        const newProgress = Math.round(((i + 1) / targets.length) * 100)
        setProgress(newProgress)

        // 2. Wait logic (Resend: 2-5s, Gmail: 5-8s)
        if (i < targets.length - 1) {
          const waitSeconds = provider === 'resend' 
            ? Math.floor(Math.random() * 4) + 2
            : Math.floor(Math.random() * 4) + 5
            
          setSecondsRemaining(waitSeconds)
          setNextSendAt(Date.now() + waitSeconds * 1000)

          await new Promise((resolve) =>
            setTimeout(resolve, waitSeconds * 1000),
          )
          setNextSendAt(null)
        }
      }

      toast.success('Proses broadcast selesai!')
      setStatus('done')
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
      console.error(error)
      setStatus('idle')
    } finally {
      setIsSending(false)
    }
  }

  const effectiveCount = isAllMode ? totalCount : selectedIds.length

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => !isSending && onOpenChange(val)}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100/50 text-indigo-600">
            <Mail className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-black tracking-tight uppercase">
            Broadcast Undangan Email
          </DialogTitle>
          <DialogDescription className="leading-relaxed font-medium text-slate-500">
            {status === 'sending' ? (
              <span className="flex animate-pulse items-center gap-2 text-indigo-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Menggunakan {provider === 'resend' ? 'Resend Engine' : 'Gmail SMTP'}...
              </span>
            ) : (
              <>
                Kirim undangan ke{' '}
                <span className="font-bold text-indigo-600">
                  {effectiveCount} tamu
                </span>{' '}
                melalui saluran pilihan Anda.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {status === 'idle' && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Pilih Engine Pengiriman
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider('resend')}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
                    provider === 'resend' 
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    provider === 'resend' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black uppercase italic">Resend</p>
                    <p className="text-[9px] font-medium text-slate-500 italic">Turbo Mode (Fast)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('gmail')}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
                    provider === 'gmail' 
                      ? "border-orange-600 bg-orange-50/50 shadow-md"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    provider === 'gmail' ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black uppercase italic">Gmail</p>
                    <p className="text-[9px] font-medium text-slate-500 italic">Personal (Safe)</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span className="text-[10px] font-black tracking-widest text-indigo-700 uppercase italic">
                  Estimasi Waktu Tunggu
                </span>
              </div>
              <p className="text-[12px] leading-relaxed font-medium text-slate-700">
                {provider === 'resend' ? (
                  <>
                    Jeda pengiriman <strong>2 - 5 detik</strong> per email.
                    Estimasi total: <span className="font-bold text-indigo-600">{Math.ceil((effectiveCount * 3.5) / 60)} menit.</span>
                  </>
                ) : (
                  <>
                    Jeda pengiriman <strong>5 - 8 detik</strong> (Saran Keamanan).
                    Estimasi total: <span className="font-bold text-orange-600">{Math.ceil((effectiveCount * 6.5) / 60)} menit.</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {status === 'sending' && (
          <div className="space-y-6 py-4">
            <div className="rounded-2xl bg-slate-50 p-6 text-center shadow-inner">
              <p className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Terkirim Melalui {provider.toUpperCase()}
              </p>
              <p className="text-3xl font-black text-slate-800">
                {currentIndex} <span className="text-slate-400">/</span>{' '}
                {totalToSend}
              </p>
            </div>

            {secondsRemaining > 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-4">
                <div className="mb-1 flex items-center gap-2 text-indigo-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-[10px] font-black tracking-tight uppercase">
                    Kirim Selanjutnya Dalam:
                  </span>
                </div>
                <div className="font-mono text-3xl font-black text-indigo-600">
                  {secondsRemaining} Detik
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase italic">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 w-full bg-slate-100" />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase">Berhasil</p>
                <p className="text-2xl font-black text-emerald-800">
                  {results.filter((r) => r.success).length}
                </p>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center">
                <p className="text-[10px] font-black text-red-600 uppercase">Gagal</p>
                <p className="text-2xl font-black text-red-800">
                  {results.filter((r) => !r.success).length}
                </p>
              </div>
            </div>

            <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2 text-[11px] font-medium"
                >
                  <span className="max-w-[200px] truncate text-slate-700">{r.name}</span>
                  {r.success ? (
                    <span className="font-bold text-emerald-600 uppercase italic">Success</span>
                  ) : (
                    <span className="font-bold text-red-500 uppercase italic">Gagal</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          {status === 'done' ? (
            <Button
              onClick={() => {
                onOpenChange(false)
                const successIds = results
                  .filter((r) => r.success)
                  .map((r) => r.id)
                onSuccess?.(successIds)
              }}
              className="h-12 w-full rounded-2xl bg-slate-900 font-bold tracking-widest text-white uppercase shadow-xl hover:bg-slate-800"
            >
              Selesai & Tutup
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-12 flex-1 rounded-2xl border-slate-200 font-bold tracking-widest uppercase italic"
                disabled={isSending}
              >
                Batal
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending}
                className="h-12 flex-1 rounded-2xl bg-indigo-600 font-bold tracking-widest text-white uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Mulai Broadcast'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
