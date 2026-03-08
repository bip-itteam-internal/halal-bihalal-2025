import { QrCode, Camera, CameraOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScannerCameraProps {
  scanning: boolean
  eventName: string
  selectedEventId: string
  autoCloseCamera: boolean
  setAutoCloseCamera: (val: boolean) => void
  onStart: () => void
  onStop: () => void
  error?: string
}

export function ScannerCamera({
  eventName,
  scanning,
  selectedEventId,
  autoCloseCamera,
  setAutoCloseCamera,
  onStart,
  onStop,
  error,
}: ScannerCameraProps) {
  return (
    <Card className="gap-0 overflow-hidden border-none shadow-sm ring-1 ring-slate-200/60">
      <CardHeader className="border-b bg-slate-50/50 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <QrCode className="text-primary h-4 w-4" />
          Scanner Point
        </CardTitle>
        <h3 className="text-xs font-bold text-slate-500">{eventName}</h3>
      </CardHeader>
      <CardContent className="p-0">
        {/* Camera Feed Container - Full Box focus */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
          <div id="qr-reader" className="h-full w-full" />

          {error && !scanning && (
            <div className="bg-destructive/10 absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center backdrop-blur-sm">
              <CameraOff className="text-destructive mb-2 h-8 w-8" />
              <p className="text-destructive text-xs font-bold">Error Kamera</p>
              <p className="text-destructive/80 mt-1 text-[10px] font-medium">
                {error}
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-4 h-8 rounded-lg text-[11px]"
                onClick={onStart}
              >
                Coba Lagi
              </Button>
            </div>
          )}

          {!scanning && !error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/40 px-4 text-center backdrop-blur-[2px]">
              <div className="mb-3 rounded-full border border-white/20 bg-white/10 p-4">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <span className="max-w-[200px] text-[11px] leading-relaxed font-medium text-white">
                Kamera belum aktif. Klik Mulai untuk menscan tiket atau gelang
                tamu.
              </span>
            </div>
          )}
        </div>

        {/* Compact Controls Area */}
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <div className="space-y-0.5">
              <p className="text-[12px] font-bold text-slate-700">
                Auto-close kamera
              </p>
              <p className="text-[10px] font-medium text-slate-500">
                Tutup otomatis setelah scan berhasil
              </p>
            </div>
            <Switch
              checked={autoCloseCamera}
              onCheckedChange={setAutoCloseCamera}
              className="scale-90"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onStart}
              disabled={scanning || !selectedEventId}
              className="bg-primary hover:bg-primary/90 h-10 rounded-xl text-[13px] font-bold"
            >
              <Camera className="mr-2 h-4 w-4" />
              Mulai Scan
            </Button>
            <Button
              variant="outline"
              onClick={onStop}
              disabled={!scanning}
              className="h-10 rounded-xl border-slate-200 text-[13px] font-bold"
            >
              <CameraOff className="mr-2 h-4 w-4" />
              Berhenti
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
