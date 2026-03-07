import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'
import { createClient } from '@/lib/supabase/client'
import { Guest } from '@/types'

export type Step = 'exchange' | 'entrance'

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

  const [step, _setStep] = useState<Step>('exchange')
  const stepRef = useRef<Step>('exchange')
  const setStep = (val: Step) => {
    stepRef.current = val
    _setStep(val)
  }

  const [scanning, setScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)

  const [autoCloseCamera, _setAutoCloseCamera] = useState(true)
  const autoCloseRef = useRef(true)
  const setAutoCloseCamera = (val: boolean) => {
    autoCloseRef.current = val
    _setAutoCloseCamera(val)
  }
  const [pairingGuest, _setPairingGuest] = useState<Guest | null>(null)
  const pairingGuestRef = useRef<Guest | null>(null)
  const setPairingGuest = (guest: Guest | null) => {
    pairingGuestRef.current = guest
    _setPairingGuest(guest)
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

  const handlePairBracelet = async (braceletCode: string) => {
    const guestToPair = pairingGuestRef.current
    if (!guestToPair) return

    try {
      setSubmitting(true)
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: selectedEventId,
          step: 'exchange',
          guest_id: guestToPair.id,
          bracelet_to_pair: braceletCode.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal pairing gelang')

      setSuccessDialogOpen(true)
      setLastResult({
        success: true,
        message: `Gelang berhasil dipasangkan untuk ${guestToPair.full_name}`,
        guest: data.guest,
      })
      setPairingGuest(null)
      if (autoCloseRef.current) await stopScanner()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal pairing gelang')
    } finally {
      setSubmitting(false)
    }
  }

  const submitCheckin = async (payload: string) => {
    const eventId = selectedEventIdRef.current
    const currentStep = stepRef.current
    if (!payload || !eventId) return

    try {
      setSubmitting(true)
      setError('')

      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          step: currentStep,
          qr_payload: payload.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal check-in')
      }

      if (
        currentStep === 'exchange' &&
        data.guest &&
        !data.guest.bracelet_code
      ) {
        setPairingGuest(data.guest)
        setLastResult({
          success: true,
          message: `Undangan ${data.guest.full_name} valid. Silakan SCAN GELANG sekarang.`,
          guest: data.guest,
        })
        return
      }

      setSuccessDialogOpen(true)
      setLastResult({
        success: true,
        message: data.message,
        guest: data.guest,
      })
      setManualCode('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal check-in'
      setLastResult({ success: false, message })
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const startScanner = async () => {
    if (!selectedEventId) {
      setError('Pilih event terlebih dahulu.')
      return
    }

    // Hindari double start
    if (scanning || (scannerRef.current && scannerRef.current.isScanning)) {
      console.log('Scanner sudah berjalan atau sedang memulai...')
      return
    }

    try {
      setError('')

      // Periksa Secure Context (HTTPS/Localhost)
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setError(
          'Akses kamera memerlukan koneksi aman (HTTPS). Jika menggunakan IP (10.10...), pastikan menggunakan HTTPS atau gunakan localhost.',
        )
        return
      }

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError(
          'Browser Anda tidak mendukung akses kamera atau diblokir (non-HTTPS).',
        )
        return
      }

      setScanning(true) // Set loading state di awal agar tombol disabled

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader')
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (pairingGuestRef.current) {
            await handlePairBracelet(decodedText)
          } else {
            await submitCheckin(decodedText)
          }

          if (autoCloseRef.current && !pairingGuestRef.current) {
            await stopScanner()
          }
        },
        () => undefined,
      )
    } catch (err: unknown) {
      console.error('Scanner Error:', err)
      const errorMsg =
        err instanceof Error ? err.message : String(err) || 'Unknown error'

      if (errorMsg.includes('AbortError')) {
        setError('Kamera terhenti (AbortError). Silakan coba klik Mulai lagi.')
      } else if (
        errorMsg.includes('NotAllowedError') ||
        errorMsg.includes('Permission denied')
      ) {
        setError('Izin kamera ditolak. Silakan izinkan kamera di browser Anda.')
      } else if (
        errorMsg.includes('NotFoundError') ||
        errorMsg.includes('Requested device not found')
      ) {
        setError('Kamera tidak ditemukan pada perangkat ini.')
      } else {
        setError(`Gagal mengakses kamera: ${errorMsg}`)
      }

      setScanning(false)
      // Bersihkan instance jika gagal total agar bisa init ulang
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
    step,
    setStep,
    scanning,
    startScanner,
    stopScanner,
    manualCode,
    setManualCode,
    submitting,
    submitCheckin,
    error,
    setError,
    lastResult,
    setLastResult,
    autoCloseCamera,
    setAutoCloseCamera,
    pairingGuest,
    setPairingGuest,
    successDialogOpen,
    setSuccessDialogOpen,
  }
}
