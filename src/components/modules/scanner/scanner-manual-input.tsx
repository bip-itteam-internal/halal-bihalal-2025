import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ScannerManualInputProps {
  manualCode: string
  setManualCode: (code: string) => void
  onProcess: (code: string) => Promise<boolean>
  disabled: boolean
}

export function ScannerManualInput({
  manualCode,
  setManualCode,
  onProcess,
  disabled,
}: ScannerManualInputProps) {
  const [open, setOpen] = useState(false)

  const handleProcess = async () => {
    const success = await onProcess(manualCode)
    if (success) {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full rounded-xl border-slate-200 text-[13px] font-bold sm:w-auto"
        >
          <Search className="mr-2 h-4 w-4" />
          Input Manual
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Input Manual</DialogTitle>
          <DialogDescription>
            Gunakan jika QR tidak terbaca (ID tamu/kode undangan/gelang).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Contoh: INV-XXXXXX"
            className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-[13px] transition-all focus:bg-white"
          />

          <Button
            className="bg-primary hover:bg-primary/90 shadow-primary/10 h-10 w-full rounded-xl text-[13px] font-bold shadow-sm"
            onClick={handleProcess}
            disabled={!manualCode.trim() || disabled}
          >
            Proses Check-in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
