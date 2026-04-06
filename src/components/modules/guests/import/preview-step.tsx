import { useState, useMemo } from 'react'
import { Table as TableIcon, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RawGuest } from './types'

interface PreviewStepProps {
  previewData: RawGuest[]
  updatePreviewRow: (idx: number, field: keyof RawGuest, value: string) => void
  duplicateMap: Map<string, number>
  hasDuplicates: boolean
  skipDuplicates: boolean
  fileUniqueCount: number
  onBackToMapping: () => void
}

export function PreviewStep({
  previewData,
  updatePreviewRow,
  duplicateMap,
  hasDuplicates,
  skipDuplicates,
  fileUniqueCount,
  onBackToMapping,
}: PreviewStepProps) {
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(hasDuplicates)

  const displayData = useMemo(() => {
    let dataWithIndex = previewData.map((row, index) => ({ ...row, index }))

    if (skipDuplicates) {
      const seen = new Set()
      dataWithIndex = dataWithIndex.filter((row) => {
        if (!row.phone) return true
        const p = row.phone.replace(/\D/g, '')
        if (seen.has(p)) return false
        seen.add(p)
        return true
      })
    } else if (showOnlyDuplicates && hasDuplicates) {
      return dataWithIndex.filter(
        (row) => row.phone && (duplicateMap.get(row.phone) || 0) > 1,
      )
    }

    return dataWithIndex.slice(0, 100)
  }, [
    previewData,
    showOnlyDuplicates,
    hasDuplicates,
    duplicateMap,
    skipDuplicates,
  ])

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2 duration-300">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-emerald-600">
            <TableIcon className="h-3 w-3" />
            {showOnlyDuplicates && hasDuplicates && !skipDuplicates
              ? `Duplikat (${displayData.length})`
              : `Pratinjau (${fileUniqueCount} Tamu)`}
          </div>
          {hasDuplicates && !skipDuplicates && (
            <div className="flex animate-pulse items-center gap-1 text-[8px] font-bold tracking-tight text-red-500">
              <AlertCircle className="h-2.5 w-2.5" />
              Perbaiki nomor HP ganda
            </div>
          )}
          {skipDuplicates && (
            <div className="flex items-center gap-1 text-[8px] font-bold tracking-tight text-emerald-600">
              <AlertCircle className="h-2.5 w-2.5 text-emerald-500" />
              Data duplikat diabaikan otomatis
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {hasDuplicates && (
            <div className="flex items-center gap-2 transition-all">
              <Label
                htmlFor="show-duplicates"
                className="cursor-pointer text-[8px] font-bold tracking-wider text-red-600"
              >
                Hanya Duplikat
              </Label>
              <Switch
                id="show-duplicates"
                checked={showOnlyDuplicates}
                onCheckedChange={setShowOnlyDuplicates}
                className="h-3.5 w-6 scale-75 data-[state=checked]:bg-red-500"
              />
            </div>
          )}
          <button
            onClick={onBackToMapping}
            className="hover:text-primary hover:decoration-primary/50 text-[8px] font-bold tracking-wider text-slate-400 underline decoration-slate-200 decoration-1 underline-offset-4 transition-colors"
          >
            Ubah Mapping
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white">
        <div className="scrollbar-thin scrollbar-thumb-slate-200 max-h-[480px] overflow-auto">
          <Table className="relative border-separate border-spacing-0">
            <TableHeader className="sticky top-0 z-30 border-b bg-white">
              <TableRow className="border-b transition-none hover:bg-transparent">
                <TableHead className="sticky top-0 z-30 h-7 w-8 bg-slate-50/95 py-0 text-center text-[8px] font-bold tracking-widest text-slate-400 backdrop-blur-sm">
                  No.
                </TableHead>
                <TableHead className="sticky top-0 z-30 h-7 bg-slate-50/95 py-0 text-[9px] font-bold tracking-wider text-slate-400 backdrop-blur-sm">
                  Nama
                </TableHead>
                <TableHead className="sticky top-0 z-30 h-7 bg-slate-50/95 py-0 text-center text-[9px] font-bold tracking-wider text-slate-400 backdrop-blur-sm">
                  Tipe
                </TableHead>
                <TableHead className="sticky top-0 z-30 h-7 bg-slate-50/95 py-0 text-[9px] font-bold tracking-wider text-slate-400 backdrop-blur-sm">
                  Kontak
                </TableHead>
                <TableHead className="sticky top-0 z-30 h-7 bg-slate-50/95 py-0 text-center text-[9px] font-bold tracking-wider text-slate-400 backdrop-blur-sm">
                  Baju
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row) => (
                <TableRow
                  key={row.index}
                  className={`border-slate-50 transition-none hover:bg-slate-50 ${
                    row.phone && duplicateMap.get(row.phone)! > 1
                      ? 'bg-red-50/20'
                      : ''
                  }`}
                >
                  <TableCell className="py-1 text-center text-[8px] font-bold text-slate-400">
                    {row.index + 1}
                  </TableCell>
                  <TableCell className="py-1 text-[11px] font-bold tracking-tight text-slate-900">
                    {row.full_name}
                  </TableCell>
                  <TableCell className="py-1 text-center">
                    <Badge
                      variant="outline"
                      className={`h-3.5 scale-90 border px-1 text-[7px] font-bold tracking-widest ${
                        row.guest_type === 'internal'
                          ? 'border-blue-100 bg-blue-50 text-blue-700'
                          : row.guest_type === 'external'
                            ? 'border-amber-100 bg-amber-50 text-amber-700'
                            : 'border-purple-100 bg-purple-50 text-purple-700'
                      }`}
                    >
                      {row.guest_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="min-w-[130px] space-y-0.5">
                      <div className="group/input relative flex items-center gap-1.5">
                        <input
                          type="text"
                          value={row.phone || ''}
                          onChange={(e) =>
                            updatePreviewRow(row.index, 'phone', e.target.value)
                          }
                          className={`focus:outline-primary/40 w-full rounded border bg-slate-50 px-1 py-0 text-[10px] font-bold ring-0 transition-all focus:bg-white focus:ring-1 focus:ring-emerald-200 ${
                            row.phone && duplicateMap.get(row.phone)! > 1
                              ? 'border-red-200 text-red-600'
                              : 'border-slate-100 text-slate-700 hover:border-slate-300'
                          }`}
                          placeholder="WhatsApp..."
                        />
                      </div>
                      {row.email && (
                        <div className="font-sm max-w-[150px] truncate px-1 text-[8px] text-slate-400/80">
                          {row.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1 text-center">
                    <Badge
                      variant="outline"
                      className="h-3.5 scale-90 border-slate-100 bg-slate-50 px-1 text-[7px] font-bold tracking-widest text-slate-600"
                    >
                      {row.shirt_size || '-'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {previewData.length > 100 && (
            <div className="border-t border-slate-100 bg-slate-50/80 p-5 text-center text-[11px] font-bold tracking-widest text-slate-400 backdrop-blur-sm">
              * Hanya menampilkan 100 dari {previewData.length} tamu. Data
              lainnya tetap akan diproses.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
