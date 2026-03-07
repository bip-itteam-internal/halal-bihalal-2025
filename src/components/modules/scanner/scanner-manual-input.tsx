import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ScannerManualInputProps {
  manualCode: string
  setManualCode: (code: string) => void
  onProcess: (code: string) => void
  disabled: boolean
}

export function ScannerManualInput({
  manualCode,
  setManualCode,
  onProcess,
  disabled,
}: ScannerManualInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Manual</CardTitle>
        <CardDescription>
          Gunakan jika QR tidak terbaca (ID tamu/kode undangan/kode gelang).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Contoh: Kode Undangan (INV-XXXXXX)"
        />
        <Button
          className="w-full"
          onClick={() => onProcess(manualCode)}
          disabled={!manualCode.trim() || disabled}
        >
          Proses Check-in
        </Button>
      </CardContent>
    </Card>
  )
}
