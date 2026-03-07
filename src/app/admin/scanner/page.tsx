'use client'

import { Suspense } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { useScanner } from './use-scanner'
import { ScannerHeader } from '@/components/modules/scanner/scanner-header'
import { ScannerCamera } from '@/components/modules/scanner/scanner-camera'
import { ScannerManualInput } from '@/components/modules/scanner/scanner-manual-input'
import { ScannerSuccessDialog } from '@/components/modules/scanner/scanner-success-dialog'

function ScannerContent() {
  const {
    selectedEventId,
    selectedEventName,
    scanning,
    startScanner,
    stopScanner,
    manualCode,
    setManualCode,
    submitting,
    submitCheckin,
    cameraError,
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
    <AppLayout header={<ScannerHeader />}>
      <div className="mx-auto w-full max-w-4xl space-y-4 p-3 sm:p-4 lg:p-6">
        <div className="space-y-4">
          <ScannerCamera
            eventName={selectedEventName}
            scanning={scanning}
            selectedEventId={selectedEventId}
            autoCloseCamera={autoCloseCamera}
            setAutoCloseCamera={setAutoCloseCamera}
            onStart={startScanner}
            onStop={stopScanner}
            error={cameraError}
          />

          <ScannerManualInput
            manualCode={manualCode}
            setManualCode={setManualCode}
            onProcess={submitCheckin}
            disabled={!manualCode.trim() || !selectedEventId || submitting}
          />
        </div>
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
