'use client'

import { FileUp, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EventOption } from './types'

interface UploadStepProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  loadingEvents: boolean
  events: EventOption[]
  selectedEventIds: string[]
  setSelectedEventIds: (ids: string[] | ((prev: string[]) => string[])) => void
  hasFile: boolean
  rowCount: number
}

export function UploadStep({
  onFileUpload,
  fileInputRef,
  loadingEvents,
  events,
  selectedEventIds,
  setSelectedEventIds,
  hasFile,
  rowCount,
}: UploadStepProps) {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <div className="space-y-4 rounded-xl border-2 border-dashed bg-slate-50/50 p-10 text-center transition-all hover:bg-slate-50">
        <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full shadow-sm">
          <FileUp className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            Klik untuk upload atau drag and drop
          </p>
          <p className="text-muted-foreground text-[11px] leading-none font-medium">
            Mendukung file Excel (.xlsx) atau CSV
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx, .xls, .csv"
          onChange={onFileUpload}
        />
        <Button
          variant="secondary"
          size="sm"
          className="h-8 px-4 text-xs font-bold shadow-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Pilih File
        </Button>
        {hasFile && (
          <div className="animate-in slide-in-from-top-1 mx-auto flex w-fit items-center justify-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            FILE SIAP DIPROSES ({rowCount} BARIS)
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-amber-100 bg-amber-50/40 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-amber-700 uppercase">
            <Calendar className="h-4 w-4" />
            Target Acara
          </div>
          {selectedEventIds.length > 0 && (
            <Badge
              variant="outline"
              className="h-5 border-amber-200 bg-white px-2 text-[9px] font-semibold text-amber-700"
            >
              {selectedEventIds.length} Terpilih
            </Badge>
          )}
        </div>
        <div className="space-y-2.5">
          <p className="text-[10px] leading-relaxed font-medium text-slate-500 italic">
            * Seluruh daftar tamu yang diimpor akan langsung dihubungkan
            (assign) ke acara yang Anda centang di bawah ini.
          </p>
          <div className="scrollbar-thin scrollbar-thumb-amber-200 max-h-[160px] space-y-1.5 overflow-y-auto rounded-lg border border-amber-200 bg-white/80 p-2">
            {loadingEvents ? (
              <div className="flex h-16 items-center justify-center gap-3 text-xs font-medium text-amber-600/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengambil daftar acara...
              </div>
            ) : events.length === 0 ? (
              <div className="py-4 text-center text-xs text-amber-600 italic">
                Belum ada acara yang tersedia.
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    const isSelected = selectedEventIds.includes(ev.id)
                    if (isSelected) {
                      setSelectedEventIds((prev) =>
                        prev.filter((id) => id !== ev.id),
                      )
                    } else {
                      setSelectedEventIds((prev) => [...prev, ev.id])
                    }
                  }}
                  className={`group flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-all duration-200 ${
                    selectedEventIds.includes(ev.id)
                      ? 'border-amber-200 bg-amber-100/60 shadow-sm'
                      : 'border-transparent bg-transparent hover:bg-amber-50'
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-200 ${
                      selectedEventIds.includes(ev.id)
                        ? 'border-amber-600 bg-amber-600'
                        : 'border-amber-300 bg-white shadow-sm group-hover:border-amber-400'
                    }`}
                  >
                    {selectedEventIds.includes(ev.id) && (
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={4}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold tracking-tight transition-colors ${
                      selectedEventIds.includes(ev.id)
                        ? 'text-amber-900'
                        : 'text-slate-600'
                    }`}
                  >
                    {ev.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
