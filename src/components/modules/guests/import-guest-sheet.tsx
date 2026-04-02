'use client'

import { FileUp, AlertCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import * as XLSX from 'xlsx'

import { useImportGuest } from './import/use-import-guest'
import { UploadStep } from './import/upload-step'
import { MappingStep } from './import/mapping-step'
import { PreviewStep } from './import/preview-step'
import { ImportFooter } from './import/import-footer'

interface ImportGuestSheetProps {
  eventId: string
  onSuccess?: () => void
}

export function ImportGuestSheet({
  eventId,
  onSuccess,
}: ImportGuestSheetProps) {
  const {
    isOpen,
    setIsOpen,
    step,
    setStep,
    isProcessing,
    error,
    rawFileData,
    availableColumns,
    columnMapping,
    setColumnMapping,
    previewData,
    updatePreviewRow,
    duplicateMap,
    hasDuplicates,
    defaultGuestType,
    setDefaultGuestType,
    fileInputRef,
    handleFileUpload,
    applyMapping,
    submitImport,
    resetState,
    skipDuplicates,
    setSkipDuplicates,
    fileUniqueCount,
  } = useImportGuest(eventId, onSuccess)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) resetState()
  }

  const downloadTemplate = () => {
    const templateData = [
      {
        nama_lengkap: 'Budi Santoso',
        tipe: 'internal',
        whatsapp: '08123456789',
        email: 'budi@example.com',
        alamat_instansi: 'Divisi IT',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template Tamu')
    XLSX.writeFile(wb, 'template_tamu.xlsx')
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="border-slate-200 font-bold transition-all hover:bg-slate-50"
        >
          <FileUp className="mr-2 h-4 w-4" />
          Impor Data
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col border-l bg-white p-0 sm:max-w-2xl">
        <SheetHeader className="border-b bg-slate-50/50 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <SheetTitle className="border-r border-slate-200 pr-4 text-lg font-bold tracking-tight text-slate-900">
              Impor Daftar Tamu
            </SheetTitle>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 text-[9px] font-bold tracking-widest"
            >
              Langkah {step === 'upload' ? '1' : step === 'mapping' ? '2' : '3'}{' '}
              <span className="mx-1 opacity-40">dari</span> 3
            </Badge>
          </div>
          <SheetDescription className="mt-0.5 text-[12px] font-medium text-slate-500">
            {step === 'upload' &&
              'Unggah file Excel atau CSV berisi daftar tamu.'}
            {step === 'mapping' &&
              'Cocokkan kolom file Anda dengan data yang dibutuhkan sistem.'}
            {step === 'preview' && 'Tinjau data sebelum disimpan ke database.'}
          </SheetDescription>
        </SheetHeader>

        <div className="scrollbar-thin scrollbar-thumb-slate-200 flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <Alert
              variant="destructive"
              className="animate-in zoom-in-95 mb-4 border-red-200 bg-red-50/50"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs font-bold tracking-widest">
                Kesalahan
              </AlertTitle>
              <AlertDescription className="text-xs font-semibold">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {step === 'upload' && (
            <div className="space-y-6">
              <UploadStep
                fileInputRef={fileInputRef}
                onFileUpload={handleFileUpload}
                defaultGuestType={defaultGuestType}
                setDefaultGuestType={setDefaultGuestType}
                hasFile={rawFileData.length > 0}
                rowCount={rawFileData.length}
                skipDuplicates={skipDuplicates}
                setSkipDuplicates={setSkipDuplicates}
              />

              <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex items-center gap-3 text-blue-700">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Download className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold tracking-tight">
                      Butuh template?
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600/70">
                      Sesuaikan format file Anda agar mapping lebih mudah.
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 border border-blue-200 bg-white px-4 text-xs font-bold text-blue-700 hover:bg-blue-100"
                  onClick={downloadTemplate}
                >
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <MappingStep
              availableColumns={availableColumns}
              columnMapping={columnMapping}
              setColumnMapping={setColumnMapping}
            />
          )}

          {step === 'preview' && (
            <PreviewStep
              previewData={previewData}
              updatePreviewRow={updatePreviewRow}
              duplicateMap={duplicateMap}
              hasDuplicates={hasDuplicates}
              skipDuplicates={skipDuplicates}
              fileUniqueCount={fileUniqueCount}
              onBackToMapping={() => setStep('mapping')}
            />
          )}
        </div>

        <ImportFooter
          step={step}
          setStep={setStep}
          onCancel={() => handleOpenChange(false)}
          onApplyMapping={applyMapping}
          onSubmit={submitImport}
          isProcessing={isProcessing}
          hasDuplicates={hasDuplicates}
          hasFile={rawFileData.length > 0}
          previewDataLength={previewData.length}
          skipDuplicates={skipDuplicates}
          fileUniqueCount={fileUniqueCount}
        />
      </SheetContent>
    </Sheet>
  )
}
