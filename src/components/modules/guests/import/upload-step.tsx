'use client'

import { FileUp, Calendar, Loader2, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { EventOption, RawGuest } from './types'

interface UploadStepProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  loadingEvents: boolean
  events: EventOption[]
  selectedEventIds: string[]
  setSelectedEventIds: (ids: string[] | ((prev: string[]) => string[])) => void
  defaultGuestType: RawGuest['guest_type']
  setDefaultGuestType: (type: RawGuest['guest_type']) => void
  hasFile: boolean
  rowCount: number
  skipDuplicates: boolean
  setSkipDuplicates: (skip: boolean) => void
}

export function UploadStep({
  onFileUpload,
  fileInputRef,
  loadingEvents,
  events,
  selectedEventIds,
  setSelectedEventIds,
  defaultGuestType,
  setDefaultGuestType,
  hasFile,
  rowCount,
  skipDuplicates,
  setSkipDuplicates,
}: UploadStepProps) {
  return (
    <div className="animate-in fade-in space-y-5 duration-500">
      {/* 1. Upload Area */}
      <div className="group hover:border-primary/50 relative space-y-4 overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center transition-all hover:bg-white">
        <div className="group-hover:bg-primary mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white transition-transform duration-300 group-hover:scale-110 group-hover:text-white">
          <FileUp className="text-primary h-6 w-6 group-hover:text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold tracking-tight text-slate-900">
            Unggah Berkas Tamu
          </p>
          <p className="text-[11px] font-medium text-slate-500">
            Format: Excel (.xlsx) atau CSV
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
          variant="outline"
          size="sm"
          className="hover:bg-primary h-9 rounded-full px-6 text-[10px] font-extrabold tracking-widest transition-all hover:text-white active:scale-95"
          onClick={() => fileInputRef.current?.click()}
        >
          Pilih File
        </Button>

        {hasFile && (
          <div className="animate-in zoom-in-95 pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <Badge className="h-6 gap-2 border-emerald-100 bg-emerald-500 px-3 text-[9px] font-bold tracking-widest text-white">
              <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Siap: {rowCount} Tamu
            </Badge>
          </div>
        )}
      </div>

      <div className="grid gap-5">
        {/* 2. Guest Type Selection */}
        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg">
              <UserCog className="h-3.5 w-3.5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800">
              Tipe Tamu Default
            </span>
          </div>
          <div className="flex gap-6 px-1 py-1">
            {[
              { id: 'internal', label: 'Internal' },
              { id: 'external', label: 'Eksternal' },
              { id: 'tenant', label: 'Tenant' },
            ].map((t) => (
              <div
                key={t.id}
                className="flex cursor-pointer items-center gap-2.5"
                onClick={() =>
                  setDefaultGuestType(t.id as RawGuest['guest_type'])
                }
              >
                <Checkbox
                  id={`type-${t.id}`}
                  checked={defaultGuestType === t.id}
                  className="data-[state=checked]:border-primary data-[state=checked]:bg-primary h-4.5 w-4.5 rounded border-slate-200 transition-all"
                  onCheckedChange={() =>
                    setDefaultGuestType(t.id as RawGuest['guest_type'])
                  }
                />
                <Label
                  htmlFor={`type-${t.id}`}
                  className={`cursor-pointer text-[12px] font-bold tracking-tight transition-colors ${
                    defaultGuestType === t.id
                      ? 'text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-[9px] leading-tight font-medium text-slate-400">
            * Digunakan sebagai nilai cadangan jika kolom tipe di berkas kosong.
          </p>
        </div>

        {/* 2.5 Skip Duplicates Toggle */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-800">
              Lewati Data Duplikat
            </span>
            <p className="text-[9px] leading-tight font-medium text-slate-400">
              Jangan simpan data tamu yang nomor teleponnya sudah terdaftar.
            </p>
          </div>
          <Checkbox
            id="skip-duplicates"
            checked={skipDuplicates}
            className="data-[state=checked]:border-primary data-[state=checked]:bg-primary h-5 w-5 rounded-md border-slate-200 transition-all"
            onCheckedChange={(checked) => setSkipDuplicates(!!checked)}
          />
        </div>

        {/* 3. Event Selection */}
        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-800">
                Hubungkan ke Acara
              </span>
            </div>
            {selectedEventIds.length > 0 && (
              <Badge
                variant="secondary"
                className="h-5 bg-orange-100 px-2 text-[9px] font-bold text-orange-700"
              >
                {selectedEventIds.length} Terpilih
              </Badge>
            )}
          </div>

          <div className="scrollbar-none max-h-[140px] space-y-1 overflow-y-auto rounded-xl border border-slate-50 bg-slate-50/30 p-1">
            {loadingEvents ? (
              <div className="flex h-20 items-center justify-center gap-3 text-[10px] font-bold tracking-widest text-slate-400">
                <Loader2 className="text-primary h-4 w-4 animate-spin" />
                Mohon tunggu...
              </div>
            ) : events.length === 0 ? (
              <div className="py-8 text-center text-[10px] font-bold text-slate-400 italic">
                Sistem tidak menemukan acara aktif.
              </div>
            ) : (
              events.map((ev) => {
                const isSelected = selectedEventIds.includes(ev.id)
                return (
                  <button
                    key={ev.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedEventIds((prev) =>
                          prev.filter((id) => id !== ev.id),
                        )
                      } else {
                        setSelectedEventIds((prev) => [...prev, ev.id])
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-orange-200 bg-white'
                        : 'border-transparent hover:border-slate-100 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="h-3 w-3 text-white"
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
                      className={`truncate text-[11px] font-bold tracking-tight ${
                        isSelected ? 'text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      {ev.name}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
