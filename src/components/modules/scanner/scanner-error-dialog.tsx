import { XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScanResult } from '@/app/admin/scanner/use-scanner'

interface ScannerErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: ScanResult | null
  onConfirm: () => void
}

export function ScannerErrorDialog({
  open,
  onOpenChange,
  result,
  onConfirm,
}: ScannerErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-destructive border-2 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center justify-center pt-4">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <XCircle className="text-destructive h-12 w-12" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-red-700">
            Check-in Gagal!
          </DialogTitle>
          <div className="mt-4 flex w-full flex-col items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-4">
            <AlertCircle className="text-destructive h-5 w-5" />
            <DialogDescription className="text-center text-base font-bold text-red-900">
              {result?.message || 'Terjadi kesalahan saat memproses data.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        {result?.guest && (
          <div className="mb-2 space-y-3 rounded-xl border border-red-100 bg-red-50/50 p-4">
            <div className="flex items-center justify-between border-b border-red-100 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-700/60">
                Nama Tamu
              </span>
              <span className="text-base font-black text-red-950">
                {result.guest.full_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-700/60">
                Tipe Tamu
              </span>
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 uppercase">
                {result.guest.guest_type}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2 sm:justify-center">
          <Button
            type="button"
            variant="destructive"
            className="h-12 w-full rounded-xl text-lg font-bold shadow-lg sm:w-48"
            onClick={onConfirm}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            COBA LAGI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
