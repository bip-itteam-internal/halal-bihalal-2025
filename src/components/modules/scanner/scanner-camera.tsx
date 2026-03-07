import { QrCode, Camera, CameraOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScannerCameraProps {
  scanning: boolean
  selectedEventId: string
  autoCloseCamera: boolean
  setAutoCloseCamera: (val: boolean) => void
  onStart: () => void
  onStop: () => void
  error?: string
}

export function ScannerCamera({
  scanning,
  selectedEventId,
  autoCloseCamera,
  setAutoCloseCamera,
  onStart,
  onStop,
  error,
}: ScannerCameraProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          Scanner Point
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-square min-h-[260px] w-full overflow-hidden rounded-md border bg-slate-50">
          <div id="qr-reader" className="h-full w-full" />

          {error && !scanning && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-50/90 px-6 text-center">
              <CameraOff className="mb-2 h-10 w-10 text-red-500" />
              <p className="text-sm font-semibold text-red-700">Error Kamera</p>
              <p className="mt-1 text-xs text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
                onClick={onStart}
              >
                Coba Lagi
              </Button>
            </div>
          )}

          {!scanning && !error && (
            <div className="bg-muted/90 text-muted-foreground absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center text-sm">
              <QrCode className="mb-2 h-10 w-10" />
              <span>
                Kamera belum aktif. Klik Mulai untuk menscan Barcode 1
                (Undangan) atau Barcode 2 (Gelang).
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Tutup kamera setelah scan</p>
            <p className="text-muted-foreground text-xs">
              Membantu efisiensi baterai pada perangkat mobile.
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
            Mulai Scan
          </Button>
          <Button variant="outline" onClick={onStop} disabled={!scanning}>
            <CameraOff className="mr-2 h-4 w-4" />
            Berhenti
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
