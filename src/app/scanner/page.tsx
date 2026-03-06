'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  MoveLeft,
  Ticket,
  AlertCircle,
  CheckCircle2,
  QrCode,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Guest } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/layout/app-layout'
import { Switch } from '@/components/ui/switch'

interface ScanResult {
  success: boolean
  message: string
  guest?: Guest
}

export default function ScannerPage() {
  const [session, setSession] = useState<'siang' | 'malam'>('siang')
  const [scanning, setScanning] = useState(false)
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [braceletGiven, setBraceletGiven] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('reader')
      }

      setScanning(true)
      setError('')

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          handleScan(decodedText)
          stopScanner()
        },
        () => {
          // Keep scanning...
        },
      )
    } catch (err: unknown) {
      setError(
        'Gagal mengakses kamera: ' +
          (err instanceof Error ? err.message : 'Error tidak dikenal'),
      )
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop()
      setScanning(false)
    }
  }

  const handleScan = async (guestId: string) => {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: guestId,
          session_type: session,
          bracelet_given:
            session === 'siang' || session === 'malam' ? braceletGiven : false,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Gagal check-in')
      }

      setLastResult({
        success: true,
        guest: data.guest,
        message: data.message,
      })

      setTimeout(() => setLastResult(null), 5000)
    } catch (err: unknown) {
      setLastResult({
        success: false,
        message: err instanceof Error ? err.message : 'Gagal check-in',
      })
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
      }
    }
  }, [])

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col">
        <header className="bg-background sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <MoveLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Event Scanner</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={session === 'siang' ? 'default' : 'secondary'}
              onClick={() => setSession('siang')}
              size="sm"
            >
              Siang
            </Button>
            <Button
              variant={session === 'malam' ? 'default' : 'secondary'}
              onClick={() => setSession('malam')}
              size="sm"
            >
              Malam
            </Button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-lg flex-1 space-y-6 p-6">
          <Card>
            <CardContent className="p-0">
              <div
                id="reader"
                className="flex aspect-square w-full items-center justify-center overflow-hidden bg-slate-950 text-white"
              >
                {!scanning && (
                  <div className="flex flex-col items-center space-y-6 p-6 text-center">
                    <QrCode className="text-muted-foreground h-16 w-16" />
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        Camera Ready
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">
                        Point your camera at the QR code to begin check-in.
                      </p>
                    </div>
                    <Button onClick={startScanner} size="lg">
                      Open Camera
                    </Button>
                  </div>
                )}
              </div>

              {scanning && (
                <div className="border-t border-slate-800 bg-slate-900 p-4">
                  <Button
                    variant="outline"
                    onClick={stopScanner}
                    className="text-foreground w-full"
                  >
                    Cancel Scan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Ticket className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-base font-semibold">
                  Distribute Bracelet
                </CardTitle>
              </div>
              <Switch
                checked={braceletGiven}
                onCheckedChange={setBraceletGiven}
              />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Toggle this if you are giving a bracelet to the guest during
                check-in.
              </p>
            </CardContent>
          </Card>

          {lastResult && (
            <Card
              className={cn(
                'border-l-4',
                lastResult.success
                  ? 'border-l-emerald-500'
                  : 'border-l-red-500',
              )}
            >
              <CardContent className="flex items-start gap-4 pt-6">
                {lastResult.success ? (
                  <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 shrink-0 text-red-500" />
                )}
                <div className="space-y-2">
                  <h3 className="text-lg leading-none font-semibold">
                    {lastResult.success ? 'Success!' : 'Failed!'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {lastResult.message}
                  </p>
                  {lastResult.success && lastResult.guest && (
                    <div className="pt-2">
                      <p className="text-lg font-semibold">
                        {lastResult.guest.full_name}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="secondary">
                          {lastResult.guest.guest_type}
                        </Badge>
                        <Badge variant="outline">
                          {(lastResult.guest.guest_type === 'tenant'
                            ? lastResult.guest.metadata.umkm_product
                            : lastResult.guest.address) || 'PERSONAL'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="flex gap-3 pt-6">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <p className="text-sm font-medium text-red-500">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
