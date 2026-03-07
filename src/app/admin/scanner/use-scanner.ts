import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'
import { createClient } from '@/lib/supabase/client'
import { Guest } from '@/types'

export type EventOption = {
  id: string
  name: string
}

export type ScanResult = {
  success: boolean
  message: string
  guest?: Guest
}

export function useScanner() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const [events, setEvents] = useState<EventOption[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [selectedEventId, _setSelectedEventId] = useState('')
  const selectedEventIdRef = useRef('')
  const setSelectedEventId = (id: string) => {
    selectedEventIdRef.current = id
    _setSelectedEventId(id)
  }

  const [scanning, setScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [manualError, setManualError] = useState('')
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)

  const [autoCloseCamera, _setAutoCloseCamera] = useState(true)
  const autoCloseRef = useRef(true)
  const setAutoCloseCamera = (val: boolean) => {
    autoCloseRef.current = val
    _setAutoCloseCamera(val)
  }

  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  const selectedEventName = useMemo(
    () => events.find((event) => event.id === selectedEventId)?.name || '-',
    [events, selectedEventId],
  )

  const fetchEvents = useCallback(async () => {
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
  }, [supabase])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    const eventIdFromUrl = searchParams.get('event') || ''
    if (!eventIdFromUrl && !loadingEvents && events.length > 0) {
      router.push('/admin/events')
    }
    setSelectedEventId(eventIdFromUrl)
  }, [searchParams, loadingEvents, events, router])

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => undefined)
      }
    }
  }, [])

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop()
    }
    setScanning(false)
  }

  const submitCheckin = async (
    payload: string,
    source: 'manual' | 'scan' = 'manual',
  ) => {
    const eventId = selectedEventIdRef.current
    if (!payload || !eventId) return false

    try {
      setSubmitting(true)
      setManualError('')

      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          qr_payload: payload.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal check-in')
      }

      setSuccessDialogOpen(true)
      setLastResult({
        success: true,
        message: data.message,
        guest: data.guest,
      })
      setManualCode('')
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal check-in'
      setLastResult({ success: false, message })
      if (source === 'manual') {
        setManualError(message)
      }
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const startScanner = async () => {
    if (!selectedEventId) {
      setCameraError('Pilih event terlebih dahulu.')
      return
    }

    if (scanning || (scannerRef.current && scannerRef.current.isScanning)) {
      return
    }

    try {
      setCameraError('')

      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setCameraError('Akses kamera memerlukan koneksi aman (HTTPS).')
        return
      }

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError('Browser Anda tidak mendukung akses kamera.')
        return
      }

      setScanning(true)

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader')
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10 },
        async (decodedText) => {
          await submitCheckin(decodedText, 'scan')
          if (autoCloseRef.current) {
            await stopScanner()
          }
        },
        () => undefined,
      )
    } catch (err: unknown) {
      console.error('Scanner Error:', err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      setCameraError(`Gagal mengakses kamera: ${errorMsg}`)
      setScanning(false)
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) await scannerRef.current.stop()
        } catch {
          /* ignore */
        }
        scannerRef.current = null
      }
    }
  }

  return {
    events,
    loadingEvents,
    selectedEventId,
    setSelectedEventId,
    selectedEventName,
    scanning,
    startScanner,
    stopScanner,
    manualCode,
    setManualCode,
    submitting,
    submitCheckin,
    cameraError,
    setCameraError,
    manualError,
    setManualError,
    lastResult,
    setLastResult,
    autoCloseCamera,
    setAutoCloseCamera,
    successDialogOpen,
    setSuccessDialogOpen,
  }
}
