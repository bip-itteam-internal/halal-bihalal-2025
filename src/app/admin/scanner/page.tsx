'use client'

import { Suspense } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { useScanner } from './use-scanner'
import { ScannerHeader } from '@/components/modules/scanner/scanner-header'
import { ScannerCamera } from '@/components/modules/scanner/scanner-camera'
import { ScannerManualInput } from '@/components/modules/scanner/scanner-manual-input'
import { ScannerResultCard } from '@/components/modules/scanner/scanner-result-card'
import { ScannerSuccessDialog } from '@/components/modules/scanner/scanner-success-dialog'

function ScannerContent() {
  const {
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
    error,
    lastResult,
    setLastResult,
    autoCloseCamera,
    setAutoCloseCamera,
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
    }
  }

  return (
    <AppLayout header={<ScannerHeader eventName={selectedEventName} />}>
      <div className="mx-auto w-full max-w-4xl space-y-4 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <ScannerCamera
            scanning={scanning}
            selectedEventId={selectedEventId}
            autoCloseCamera={autoCloseCamera}
            setAutoCloseCamera={setAutoCloseCamera}
            onStart={startScanner}
            onStop={stopScanner}
            error={error}
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

export default function AdminScannerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Memuat scanner...
        </div>
      }
    >
      <ScannerContent />
    </Suspense>
  )
}
