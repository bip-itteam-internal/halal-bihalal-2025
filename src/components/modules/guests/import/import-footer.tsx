'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImportStep } from './types'

interface ImportFooterProps {
  step: ImportStep
  setStep: (step: ImportStep) => void
  onCancel: () => void
  onApplyMapping: () => void
  onSubmit: () => void
  isProcessing: boolean
  hasDuplicates: boolean
  hasFile: boolean
  previewDataLength: number
  skipDuplicates: boolean
  fileUniqueCount: number
}

export function ImportFooter({
  step,
  setStep,
  onCancel,
  onApplyMapping,
  onSubmit,
  isProcessing,
  hasDuplicates,
  hasFile,
  previewDataLength,
  fileUniqueCount,
}: ImportFooterProps) {
  return (
    <div className="mt-auto border-t bg-slate-50/50 p-4 px-6 backdrop-blur-md">
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (step === 'upload') onCancel()
            else if (step === 'mapping') setStep('upload')
            else setStep('mapping')
          }}
          disabled={isProcessing}
          className="h-9 border-slate-200 px-5 text-[10px] font-bold tracking-wider text-slate-500 hover:bg-slate-100/80"
        >
          {step === 'upload' ? 'Batal' : 'Kembali'}
        </Button>

        {step === 'upload' && (
          <Button
            size="sm"
            onClick={() => setStep('mapping')}
            disabled={!hasFile}
            className="h-9 min-w-[120px] text-[10px] font-bold tracking-widest transition-all hover:translate-y-[-1px] active:translate-y-0"
          >
            Lanjutkan
          </Button>
        )}

        {step === 'mapping' && (
          <Button
            size="sm"
            onClick={onApplyMapping}
            className="h-9 min-w-[150px] text-[10px] font-bold tracking-widest transition-all hover:translate-y-[-1px] active:translate-y-0"
          >
            Pratinjau Data
          </Button>
        )}

        {step === 'preview' && (
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={isProcessing || hasDuplicates || previewDataLength === 0}
            className={`h-9 min-w-[170px] text-[10px] font-bold tracking-widest transition-all hover:translate-y-[-1px] active:translate-y-0 ${
              hasDuplicates
                ? 'cursor-not-allowed bg-slate-300 opacity-50'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Memproses...
              </div>
            ) : (
              `Simpan ${fileUniqueCount} Tamu`
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
