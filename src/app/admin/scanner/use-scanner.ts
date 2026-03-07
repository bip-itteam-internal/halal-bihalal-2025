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

  const [step, _setStep] = useState<Step>('entrance')
  const stepRef = useRef<Step>('entrance')
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
      if (autoCloseCamera) await stopScanner()
    } catch (err: any) {
      setError(err.message)
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

    try {
      setError('')
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
      setScanning(true)
    } catch (err: unknown) {
      setError(
        `Gagal mengakses kamera: ${err instanceof Error ? err.message : 'Unknown error'}`,
      )
      setScanning(false)
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
