'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'
import {
  QrCode,
  Camera,
  CameraOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Guest } from '@/types'

type Step = 'exchange' | 'entrance'

type EventOption = {
  id: string
  name: string
}

type ScanResult = {
  success: boolean
  message: string
  guest?: Guest
}

export default function AdminScannerPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const [events, setEvents] = useState<EventOption[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState(
    searchParams.get('event') || '',
  )
  const [step, setStep] = useState<Step>('entrance')
  const [scanning, setScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [autoCloseCamera, setAutoCloseCamera] = useState(true)

  const selectedEventName = useMemo(
    () => events.find((event) => event.id === selectedEventId)?.name || '-',
    [events, selectedEventId],
  )

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true)
        const { data, error } = await supabase
          .from('events')
          .select('id,name')
          .order('created_at', { ascending: false })
        if (error) throw error
        setEvents((data || []) as EventOption[])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [supabase])

  useEffect(() => {
    const eventIdFromUrl = searchParams.get('event') || ''
    setSelectedEventId(eventIdFromUrl)
  }, [searchParams])

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => undefined)
      }
    }
  }, [])

  const startScanner = async () => {
    if (!selectedEventId) {
      setError('Pilih event terlebih dahulu.')
      return
    }

    try {
      setError('')
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader')
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          await submitCheckin(decodedText)
          if (autoCloseCamera) {
            await stopScanner()
          }
        },
        () => undefined,
      )
      setScanning(true)
    } catch (err: unknown) {
      setError(
        `Gagal mengakses kamera: ${err instanceof Error ? err.message : 'Unknown error'}`,
      )
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop()
    }
    setScanning(false)
  }

  const submitCheckin = async (payload: string) => {
    if (!payload || !selectedEventId) return

    try {
      setSubmitting(true)
      setError('')

      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: selectedEventId,
          step,
          qr_payload: payload.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal check-in')
      }

      setLastResult({
        success: true,
        message: data.message,
        guest: data.guest,
      })
      setManualCode('')
      setTimeout(() => setLastResult(null), 5000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal check-in'
      setLastResult({ success: false, message })
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout
      header={
        <div className="flex flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">Scanner</h1>
            <p className="text-muted-foreground text-sm">
              Scan QR tamu untuk proses check-in.
            </p>
          </div>
          <Badge variant="outline" className="max-w-full truncate">
            {selectedEventName}
          </Badge>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 p-3 sm:p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Scanner</CardTitle>
            <CardDescription>
              Pilih event dan tahap check-in sebelum melakukan scan.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label>Event</Label>
              <Select
                value={selectedEventId}
                onValueChange={(value) => {
                  setSelectedEventId(value)
                  router.replace(`/admin/scanner?event=${value}`)
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingEvents ? 'Memuat event...' : 'Pilih event'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tahap Check-in</Label>
              <Select
                value={step}
                onValueChange={(value: Step) => setStep(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exchange">Penukaran</SelectItem>
                  <SelectItem value="entrance">Masuk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                className="bg-muted flex aspect-square min-h-[260px] w-full items-center justify-center overflow-hidden rounded-md border"
              >
                {!scanning && (
                  <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
                    <QrCode className="h-10 w-10" />
                    Kamera belum aktif
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
                <Button
                  onClick={startScanner}
                  disabled={scanning || !selectedEventId}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Mulai
                </Button>
                <Button
                  variant="outline"
                  onClick={stopScanner}
                  disabled={!scanning}
                >
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>

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
                placeholder="Contoh: UUID tamu atau INV-XXXXXX"
              />
              <Button
                className="w-full"
                onClick={() => submitCheckin(manualCode)}
                disabled={!manualCode.trim() || !selectedEventId || submitting}
              >
                Proses Check-in
              </Button>
            </CardContent>
          </Card>
        </div>

        {lastResult && (
          <Card
            className={cn(
              'border-l-4',
              lastResult.success ? 'border-l-emerald-500' : 'border-l-red-500',
            )}
          >
            <CardContent className="flex items-start gap-3 p-4 sm:pt-6">
              {lastResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">
                  {lastResult.success ? 'Check-in berhasil' : 'Check-in gagal'}
                </p>
                <p className="text-muted-foreground text-sm">{lastResult.message}</p>
                {lastResult.guest && (
                  <p className="text-sm">
                    {lastResult.guest.full_name} ({lastResult.guest.guest_type})
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {error && !lastResult && (
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4 sm:pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
