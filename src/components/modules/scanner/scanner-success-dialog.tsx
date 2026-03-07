import { CheckCircle2, Users, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScanResult } from '@/app/admin/scanner/use-scanner'

interface ScannerSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: ScanResult | null
  onConfirm: () => void
}

export function ScannerSuccessDialog({
  open,
  onOpenChange,
  result,
  onConfirm,
}: ScannerSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-emerald-500 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center justify-center pt-4">
          <div className="mb-4 rounded-full bg-emerald-100 p-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-emerald-700">
            Check-in Berhasil!
          </DialogTitle>
          <DialogDescription className="pt-2 text-center text-base">
            {result?.message}
          </DialogDescription>
        </DialogHeader>

        {result?.guest && (
          <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-4 w-4" /> Nama Tamu
              </span>
              <span className="text-lg font-bold">
                {result.guest.full_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                <Info className="h-4 w-4" /> Tipe Tamu
              </span>
              <Badge variant="outline" className="capitalize">
                {result.guest.guest_type}
              </Badge>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            className="h-12 w-full bg-emerald-600 text-lg font-bold hover:bg-emerald-700 sm:w-48"
            onClick={onConfirm}
          >
            OKE, LANJUT SCAN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
