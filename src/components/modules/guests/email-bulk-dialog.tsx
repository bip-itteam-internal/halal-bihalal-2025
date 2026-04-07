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
import { Mail, Loader2, AlertCircle, Clock } from 'lucide-react'
import { sendSingleEmailAction } from '@/app/actions/email-actions'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

interface EmailBulkDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  isAllMode?: boolean
  totalCount?: number
  searchFilter?: string
  onSuccess?: (updatedIds: string[]) => void
}

export function EmailBulkDialog({
  isOpen,
  onOpenChange,
  selectedIds,
  isAllMode = false,
  totalCount = 0,
  searchFilter = '',
  onSuccess,
}: EmailBulkDialogProps) {
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

      let finalIds = [...selectedIds]

      if (isAllMode) {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        let query = supabase
          .from('guests')
          .select('id, full_name')
          .order('full_name')
        if (searchFilter) {
          query = query.ilike('full_name', `%${searchFilter}%`)
        }
        const { data, error } = await query.limit(1000)
        if (error) throw error
        finalIds = (data || []).map((g) => g.id)
      }

      if (finalIds.length === 0) {
        toast.error('Tidak ada tamu yang dipilih.')
        setStatus('idle')
        setIsSending(false)
        return
      }

      setTotalToSend(finalIds.length)
      const batchResults: typeof results = []

      for (let i = 0; i < finalIds.length; i++) {
        setCurrentIndex(i + 1)

        // 1. Send call
        const res = await sendSingleEmailAction(finalIds[i])

        batchResults.push({
          id: finalIds[i],
          name: `Tamu #${i + 1}`,
          success: res.success,
          message: res.message || (res.success ? 'Berhasil' : 'Gagal'),
        })
        setResults([...batchResults])

        const newProgress = Math.round(((i + 1) / finalIds.length) * 100)
        setProgress(newProgress)

        // 2. Wait 1-5 minutes if not the last one
        if (i < finalIds.length - 1) {
          const waitSeconds = Math.floor(Math.random() * 241) + 60
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
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100/50 text-amber-600">
            <Mail className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-black tracking-tight uppercase">
            Broadcast Undangan Email
          </DialogTitle>
          <DialogDescription className="leading-relaxed font-medium text-slate-500">
            {status === 'sending' ? (
              <span className="flex animate-pulse items-center gap-2 text-amber-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sedang memproses pengiriman aman (jeda 1-5 menit)...
              </span>
            ) : (
              <>
                Kirim undangan ke{' '}
                <span className="font-bold text-amber-600">
                  {effectiveCount} tamu
                </span>{' '}
                dengan jeda waktu aman.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {status === 'sending' && (
          <div className="space-y-6 py-4">
            <div className="rounded-2xl bg-slate-50 p-6 text-center shadow-inner">
              <p className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Status Antrean
              </p>
              <p className="text-3xl font-black text-slate-800">
                {currentIndex} <span className="text-slate-400">/</span>{' '}
                {totalToSend}
              </p>
            </div>

            {secondsRemaining > 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-amber-700">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm font-bold tracking-tight uppercase">
                    Kirim Selanjutnya Dalam:
                  </span>
                </div>
                <div className="font-mono text-4xl font-black text-amber-600">
                  {Math.floor(secondsRemaining / 60)}:
                  {String(secondsRemaining % 60).padStart(2, '0')}
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

            <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <p className="text-[11px] leading-relaxed text-blue-700">
                <strong>PENTING:</strong> Jangan tutup halaman atau tab browser
                ini selama proses pengiriman berlangsung agar jeda waktu tetap
                berjalan.
              </p>
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase">
                  Berhasil
                </p>
                <p className="text-2xl font-black text-emerald-800">
                  {results.filter((r) => r.success).length}
                </p>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center">
                <p className="text-[10px] font-black text-red-600 uppercase">
                  Gagal
                </p>
                <p className="text-2xl font-black text-red-800">
                  {results.filter((r) => !r.success).length}
                </p>
              </div>
            </div>

            <div className="max-h-[250px] space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2 text-[11px] font-medium"
                >
                  <span className="max-w-[200px] truncate text-slate-700">
                    {r.name}
                  </span>
                  {r.success ? (
                    <span className="font-bold text-emerald-600 uppercase">
                      Success
                    </span>
                  ) : (
                    <span className="font-bold text-red-500 uppercase">
                      {r.message.toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="space-y-4 py-4">
            <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-[10px] font-black tracking-widest text-amber-700 uppercase">
                  Proteksi Akun Gmail
                </span>
              </div>
              <p className="text-[12px] leading-relaxed font-medium text-amber-800/80">
                Sesuai permintaan, sistem akan memberikan jeda acak{' '}
                <strong>1 - 5 menit</strong> per email untuk meminimalkan risiko
                blokir.
                <br />
                <br />
                <span className="italic">
                  Estimasi waktu: {effectiveCount * 3} menit.
                </span>
              </p>
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
                className="h-12 flex-1 rounded-2xl border-slate-200 font-bold tracking-widest uppercase"
                disabled={isSending}
              >
                Batal
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending}
                className="h-12 flex-1 rounded-2xl bg-amber-600 font-bold tracking-widest text-white uppercase shadow-lg shadow-amber-200 hover:bg-amber-700"
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
