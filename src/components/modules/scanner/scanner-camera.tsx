import { QrCode, Camera, CameraOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Guest } from '@/types'

interface ScannerCameraProps {
  scanning: boolean
  pairingGuest: Guest | null
  selectedEventId: string
  autoCloseCamera: boolean
  setAutoCloseCamera: (val: boolean) => void
  onStart: () => void
  onStop: () => void
}

export function ScannerCamera({
  scanning,
  pairingGuest,
  selectedEventId,
  autoCloseCamera,
  setAutoCloseCamera,
  onStart,
  onStop,
}: ScannerCameraProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          Scan Kamera
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          id="qr-reader"
          className="bg-muted relative aspect-square min-h-[260px] w-full items-center justify-center overflow-hidden rounded-md border"
        >
          {!scanning && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 px-4 text-center text-sm">
              {pairingGuest ? (
                <>
                  <Badge variant="destructive" className="mb-2 animate-pulse">
                    MODE PAIRING GELANG
                  </Badge>
                  <QrCode className="h-10 w-10 text-emerald-500" />
                  <span className="block font-bold text-emerald-600">
                    Tamu: {pairingGuest.full_name}
                  </span>
                  <span>Klik Mulai untuk Scan Gelang</span>
                </>
              ) : (
                <>
                  <QrCode className="h-10 w-10" />
                  <span>Kamera belum aktif</span>
                </>
              )}
            </div>
          )}
          {scanning && pairingGuest && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="destructive" className="animate-pulse">
                PAIRING: {pairingGuest.full_name}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Tutup kamera setelah scan</p>
            <p className="text-muted-foreground text-xs">
              Jika aktif, kamera berhenti otomatis setelah 1 hasil.
            </p>
          </div>
          <Switch
            checked={autoCloseCamera}
            onCheckedChange={setAutoCloseCamera}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button onClick={onStart} disabled={scanning || !selectedEventId}>
            <Camera className="mr-2 h-4 w-4" />
            Mulai
          </Button>
          <Button variant="outline" onClick={onStop} disabled={!scanning}>
            <CameraOff className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
