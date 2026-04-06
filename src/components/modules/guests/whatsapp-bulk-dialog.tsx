'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MessageCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { bulkSendWhatsappAction } from '@/app/actions/whatsapp-actions'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

interface WhatsappBulkDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  isAllMode?: boolean
  totalCount?: number
  searchFilter?: string
  eventId?: string
  onSuccess?: (updatedIds: string[]) => void
}

export function WhatsappBulkDialog({
  isOpen,
  onOpenChange,
  selectedIds,
  isAllMode = false,
  totalCount = 0,
  searchFilter = '',
  eventId = '',
  onSuccess,
}: WhatsappBulkDialogProps) {
  const [isSending, setIsSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [results, setResults] = useState<{ id: string; name: string; success: boolean; message: string }[]>([])
  const eventName = 'Silaturahmi & Halal Bihalal 2026'

  const handleSend = async () => {
    try {
      setIsSending(true)
      setStatus('sending')
      setProgress(10)

      let finalIds = [...selectedIds]

      if (isAllMode) {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        let query = supabase.from('guests').select('id')
        if (searchFilter) {
          query = query.ilike('full_name', `%${searchFilter}%`)
        }
        const { data, error } = await query.limit(5000)
        if (error) throw error
        finalIds = (data || []).map((g) => g.id)
      }

      if (finalIds.length === 0) {
        toast.error('Tidak ada tamu yang dipilih.')
        setStatus('idle')
        return
      }

      setProgress(30)
      const res = await bulkSendWhatsappAction(finalIds, eventName, eventId)

      setProgress(100)
      if (res.success) {
        setResults(res.results || [])
        toast.success(res.message)
        setStatus('done')
      } else {
        toast.error(res.message || 'Gagal mengirim pesan')
        setStatus('idle')
      }
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/50 text-emerald-600">
            <MessageCircle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-black tracking-tight uppercase">
            Kirim Undangan WhatsApp
          </DialogTitle>
          <DialogDescription className="leading-relaxed font-medium text-slate-500">
            Anda akan mengirimkan undangan digital secara otomatis menggunakan
            layanan Woo-Wa ke{' '}
            <span className="font-bold text-emerald-600">
              {effectiveCount} tamu
            </span>{' '}
            terpilih.
          </DialogDescription>
        </DialogHeader>

        {status === 'sending' && (
          <div className="space-y-4 py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
            <div className="space-y-2">
              <p className="text-sm font-bold tracking-widest text-slate-800 uppercase">
                Mengirim Pesan...
              </p>
              <Progress value={progress} className="h-2 w-full bg-slate-100" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Mohon jangan menutup jendela ini
            </p>
          </div>
        )}

        {status === 'done' && (
          <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800 uppercase">
                Laporan Pengiriman
              </span>
            </div>
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2 text-[11px] font-medium"
              >
                <span className="max-w-[200px] truncate text-slate-700">
                  {r.name}
                </span>
                {r.success ? (
                  <span className="font-bold text-emerald-600">TERKIRIM</span>
                ) : (
                  <span className="font-bold text-red-500">
                    {r.message.toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {status === 'idle' && (
          <div className="space-y-4 py-4">
            <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-[10px] font-black tracking-widest text-amber-700 uppercase">
                  Penting
                </span>
              </div>
              <p className="text-[11px] leading-relaxed font-medium text-amber-800/80">
                Layanan Woo-Wa memerlukan{' '}
                <span className="font-bold">API KEY</span> yang valid dan{' '}
                <span className="font-bold">Device Terkoneksi</span>. Pesan akan
                dikirimkan secara asinkron (antrian) melalui server Woo-Wa.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          {status === 'done' ? (
            <Button 
                onClick={() => {
                    onOpenChange(false)
                    const successIds = results.filter(r => r.success).map(r => r.id)
                    onSuccess?.(successIds)
                }}
              className="h-12 w-full rounded-2xl bg-slate-900 font-bold tracking-widest text-white uppercase shadow-xl hover:bg-slate-800"
            >
              Selesai
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
                className="h-12 flex-1 rounded-2xl bg-emerald-600 font-bold tracking-widest text-white uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-700"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Kirim Sekarang'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
