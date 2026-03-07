'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { useScanner } from './use-scanner'
import { ScannerHeader } from '@/components/modules/scanner/scanner-header'
import { ScannerSettings } from '@/components/modules/scanner/scanner-settings'
import { ScannerCamera } from '@/components/modules/scanner/scanner-camera'
import { ScannerManualInput } from '@/components/modules/scanner/scanner-manual-input'
import { ScannerResultCard } from '@/components/modules/scanner/scanner-result-card'
import { ScannerSuccessDialog } from '@/components/modules/scanner/scanner-success-dialog'

export default function AdminScannerPage() {
  const {
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
  } = useScanner()

  const handleConfirmSuccess = () => {
    setSuccessDialogOpen(false)
    setLastResult(null)
    if (autoCloseCamera) {
      startScanner()
    }
  }

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setSuccessDialogOpen(false)
      setLastResult(null)
      // Logic from your earlier request: if they close it, we might want camera to resume if not auto-stopped
      // But usually "OKE" is the primary way.
    }
  }

  return (
    <AppLayout header={<ScannerHeader eventName={selectedEventName} />}>
      <div className="mx-auto w-full max-w-4xl space-y-4 p-3 sm:p-4 lg:p-6">
        <ScannerSettings
          events={events}
          loadingEvents={loadingEvents}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          step={step}
          setStep={setStep}
          pairingGuest={pairingGuest}
          setPairingGuest={setPairingGuest}
          setLastResult={setLastResult}
          setError={setError}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ScannerCamera
            scanning={scanning}
            pairingGuest={pairingGuest}
            selectedEventId={selectedEventId}
            autoCloseCamera={autoCloseCamera}
            setAutoCloseCamera={setAutoCloseCamera}
            onStart={startScanner}
            onStop={stopScanner}
          />

          <ScannerManualInput
            manualCode={manualCode}
            setManualCode={setManualCode}
            onProcess={submitCheckin}
            disabled={!manualCode.trim() || !selectedEventId || submitting}
          />
        </div>

        <ScannerResultCard result={lastResult} />

        {error && !lastResult && (
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4 sm:pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ScannerSuccessDialog
        open={successDialogOpen}
        onOpenChange={handleDialogChange}
        result={lastResult}
        onConfirm={handleConfirmSuccess}
      />
    </AppLayout>
  )
}
