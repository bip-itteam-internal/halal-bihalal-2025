'use client'

import { Settings2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ColumnMapping } from './types'

interface MappingStepProps {
  availableColumns: string[]
  columnMapping: ColumnMapping
  setColumnMapping: (
    mapping: ColumnMapping | ((prev: ColumnMapping) => ColumnMapping),
  ) => void
}

export function MappingStep({
  availableColumns,
  columnMapping,
  setColumnMapping,
}: MappingStepProps) {
  const fields = [
    {
      id: 'full_name',
      label: 'Nama Lengkap',
      required: true,
      desc: 'Nama tamu (minimal 2 kata disarankan)',
    },
    {
      id: 'phone',
      label: 'WhatsApp / Nomor HP',
      required: false,
      desc: 'Wajib unik, akan divalidasi sistem',
    },
    {
      id: 'email',
      label: 'Email',
      required: false,
      desc: 'Opsional, untuk pengiriman info tambahan',
    },
    {
      id: 'address',
      label: 'Alamat / Instansi',
      required: false,
      desc: 'Informasi tambahan asal tamu',
    },
    {
      id: 'shirt_size',
      label: 'Ukuran Kaos',
      required: false,
      desc: 'Ukuran kaos tamu (S, M, L, XL, XXL, XXXL)',
    },
  ] as const

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300">
      <div className="bg-primary/5 border-primary/10 flex items-center gap-3 rounded-xl border px-5 py-3.5">
        <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
          <Settings2 className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-primary text-[13px] font-bold tracking-widest">
            Mapping Kolom
          </h4>
          <p className="text-muted-foreground text-[10.5px] leading-none font-medium">
            Hubungkan nama kolom di file Anda dengan struktur data sistem.
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border bg-slate-50/30 p-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className="group flex flex-col gap-4 rounded-lg border border-slate-100 bg-white p-4 transition-all hover:border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold tracking-wider text-slate-500">
                  {field.label}{' '}
                  {field.required && <span className="text-red-500">*</span>}
                </p>
                <p className="text-muted-foreground text-[10px] leading-none font-medium">
                  {field.desc}
                </p>
              </div>
              <div className="w-[200px]">
                <Select
                  value={columnMapping[field.id as keyof ColumnMapping]}
                  onValueChange={(val) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      [field.id]: val,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 border-slate-200 bg-slate-50 text-xs font-bold">
                    <SelectValue placeholder="Pilih Kolom..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem
                      value="skip"
                      className="text-[11px] font-medium text-slate-400 italic"
                    >
                      -- Lewati Kolom Ini --
                    </SelectItem>
                    {availableColumns.map((col) => (
                      <SelectItem
                        key={col}
                        value={col}
                        className="py-2 text-xs font-semibold"
                      >
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
