'use client'

import { useState, useRef } from 'react'
import {
  FileUp,
  Download,
  AlertCircle,
  Loader2,
  Settings2,
  Table as TableIcon,
  Calendar,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as XLSX from 'xlsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { generateRandomCode } from '@/lib/utils'

interface RawGuest {
  full_name: string
  guest_type: string
  phone: string
  email?: string
  address?: string
}

interface ImportGuestSheetProps {
  eventId: string
  onSuccess?: () => void
}

type Step = 'upload' | 'mapping' | 'preview'

export function ImportGuestSheet({
  eventId,
  onSuccess,
}: ImportGuestSheetProps) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<Step>('upload')
  const [error, setError] = useState<string | null>(null)

  // Events Selection state (for Master page import)
  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  // Data State
  const [rawFileData, setRawFileData] = useState<Record<string, unknown>[]>([])
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    full_name: '',
    guest_type: '',
    phone: '',
    email: '',
    address: '',
  })
  const [previewData, setPreviewData] = useState<RawGuest[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetState()
    } else if (!eventId) {
      fetchEvents()
    }
  }

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true)
      const { data, error } = await supabase
        .from('events')
        .select('id, name')
        .order('created_at', { ascending: false })
      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setLoadingEvents(false)
    }
  }

  const resetState = () => {
    setStep('upload')
    setPreviewData([])
    setRawFileData([])
    setAvailableColumns([])
    setColumnMapping({
      full_name: '',
      guest_type: '',
      phone: '',
      email: '',
      address: '',
    })
    setError(null)
    setSelectedEventIds([])
    if (fileInputRef.current) fileInputRef.current.value = ''
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]

        if (data.length === 0) {
          setError('File kosong atau tidak valid.')
          return
        }

        // Extract columns from first row
        const columns = Object.keys(data[0])
        setAvailableColumns(columns)
        setRawFileData(data)

        // Auto-mapping logic
        const newMapping = { ...columnMapping }
        columns.forEach((col) => {
          const c = col.toLowerCase()
          if (
            !newMapping.full_name &&
            (c.includes('nama') || c.includes('name') || c.includes('fullname'))
          )
            newMapping.full_name = col
          if (
            !newMapping.guest_type &&
            (c.includes('tipe') || c.includes('type') || c.includes('kategori'))
          )
            newMapping.guest_type = col
          if (
            !newMapping.phone &&
            (c.includes('whatsapp') ||
              c.includes('phone') ||
              c.includes('hp') ||
              c.includes('telp') ||
              c.includes('wa'))
          )
            newMapping.phone = col
          if (!newMapping.email && c.includes('email')) newMapping.email = col
          if (
            !newMapping.address &&
            (c.includes('alamat') ||
              c.includes('address') ||
              c.includes('instansi'))
          )
            newMapping.address = col
        })
        setColumnMapping(newMapping)
        setStep('mapping')
      } catch {
        setError(
          'Gagal membaca file. Pastikan file berformat Excel (.xlsx) atau CSV.',
        )
      }
    }
    reader.readAsBinaryString(file)
  }

  const applyMapping = () => {
    if (!columnMapping.full_name) {
      setError('Kolom "Nama Lengkap" wajib dipetakan.')
      return
    }

    const mapped = rawFileData
      .map((row) => {
        return {
          full_name: String(row[columnMapping.full_name] || '').trim(),
          guest_type: 'internal' as const,
          phone: String(row[columnMapping.phone] || '').trim(),
          email: String(row[columnMapping.email] || '').trim(),
          address: '',
        }
      })
      .filter((g) => g.full_name !== '')

    setPreviewData(mapped)
    setStep('preview')
    setError(null)
  }

  const submitImport = async () => {
    if (previewData.length === 0) return

    try {
      setIsProcessing(true)

      // 1. Insert into Master Guests
      const guestsToInsert = previewData.map((g) => ({
        full_name: g.full_name,
        guest_type: ['internal', 'external', 'tenant'].includes(g.guest_type)
          ? g.guest_type
          : 'internal',
        phone: g.phone || null,
        email: g.email || null,
        address: g.address || null,
        registration_source: 'admin_invite',
        rsvp_status: 'pending',
        invitation_code: `INV-${generateRandomCode(6)}`,
      }))

      const { data: insertedGuests, error: insertError } = await supabase
        .from('guests')
        .insert(guestsToInsert)
        .select('id')

      if (insertError) throw insertError

      // 2. Link them to the event (if provided via prop or selected)
      const targetEventIds = eventId ? [eventId] : selectedEventIds

      if (
        targetEventIds.length > 0 &&
        insertedGuests &&
        insertedGuests.length > 0
      ) {
        const mappings: { guest_id: string; event_id: string }[] = []

        targetEventIds
          .filter((id) => id !== 'none')
          .forEach((eid) => {
            insertedGuests.forEach((ig) => {
              mappings.push({
                guest_id: ig.id,
                event_id: eid,
              })
            })
          })

        if (mappings.length > 0) {
          const { error: mapError } = await supabase
            .from('guest_events')
            .insert(mappings)

          if (mapError) throw mapError
        }
      }

      toast.success(
        targetEventIds.length > 0
          ? `${previewData.length} tamu berhasil diimpor dan didaftarkan ke ${targetEventIds.length} acara.`
          : `${previewData.length} tamu berhasil diimpor ke Master.`,
      )
      setIsOpen(false)
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Gagal mengimpor data tamu.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Impor Data
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <SheetTitle>Impor Daftar Tamu</SheetTitle>
            <Badge variant="secondary" className="text-[10px]">
              Step {step === 'upload' ? '1' : step === 'mapping' ? '2' : '3'} of
              3
            </Badge>
          </div>
          <SheetDescription>
            {step === 'upload' &&
              'Unggah file Excel atau CSV berisi daftar tamu.'}
            {step === 'mapping' &&
              'Cocokkan kolom file Anda dengan data yang dibutuhkan sistem.'}
            {step === 'preview' && 'Tinjau data sebelum disimpan ke database.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Kesalahan</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'upload' && (
            <div className="space-y-6">
              <div className="space-y-4 rounded-lg border-2 border-dashed bg-slate-50/50 p-10 text-center">
                <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <FileUp className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Klik untuk upload atau drag and drop
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Excel (.xlsx) atau CSV
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Pilih File
                </Button>
              </div>

              {!eventId && (
                <div className="space-y-4 rounded-lg border border-amber-100 bg-amber-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                      <Calendar className="h-4 w-4" />
                      Target Acara (Multi-Select)
                    </div>
                    {selectedEventIds.length > 0 && (
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-white text-amber-700"
                      >
                        {selectedEventIds.length} terpilih
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-[10px] leading-relaxed italic">
                      Tamu yang diimpor akan otomatis terdaftar ke semua acara
                      yang dichecklist di bawah ini.
                    </p>
                    <div className="max-h-[160px] space-y-1 overflow-y-auto rounded-md border border-amber-200 bg-white/80 p-2">
                      {loadingEvents ? (
                        <div className="flex h-12 items-center justify-center gap-2 text-xs text-amber-600">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Memuat daftar acara...
                        </div>
                      ) : (
                        events.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => {
                              const isSelected = selectedEventIds.includes(
                                ev.id,
                              )
                              if (isSelected) {
                                setSelectedEventIds((prev) =>
                                  prev.filter((id) => id !== ev.id),
                                )
                              } else {
                                setSelectedEventIds((prev) => [...prev, ev.id])
                              }
                            }}
                            className={`flex cursor-pointer items-center gap-3 rounded p-2 transition-all hover:bg-amber-100/50 ${
                              selectedEventIds.includes(ev.id)
                                ? 'bg-amber-100'
                                : ''
                            }`}
                          >
                            <div
                              className={`flex h-4 w-4 items-center justify-center rounded border border-amber-400 transition-colors ${
                                selectedEventIds.includes(ev.id)
                                  ? 'border-amber-600 bg-amber-600'
                                  : 'bg-white'
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
                            <span className="text-xs font-medium text-amber-900">
                              {ev.name}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Download className="h-4 w-4" />
                  <span className="text-xs font-semibold">Butuh template?</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-blue-700 hover:bg-blue-100"
                  onClick={downloadTemplate}
                >
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300">
              <div className="text-primary flex items-center gap-2 border-b pb-2 text-sm font-bold">
                <Settings2 className="h-4 w-4" />
                Mapping Kolom
              </div>

              <div className="grid gap-4">
                {[
                  { id: 'full_name', label: 'Nama Lengkap', required: true },
                  { id: 'phone', label: 'WhatsApp / HP', required: false },
                  { id: 'email', label: 'Email', required: false },
                ].map((field) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-2 items-center gap-4 border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {field.label}{' '}
                        {field.required && (
                          <span className="text-destructive">*</span>
                        )}
                      </p>
                      <p className="text-muted-foreground text-[10px]">
                        Pilih kolom dari file Anda
                      </p>
                    </div>
                    <Select
                      value={columnMapping[field.id]}
                      onValueChange={(val) =>
                        setColumnMapping((prev) => ({
                          ...prev,
                          [field.id]: val,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Pilih Kolom..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="skip"
                          className="text-muted-foreground italic"
                        >
                          -- Lewati --
                        </SelectItem>
                        {availableColumns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                  <TableIcon className="h-4 w-4" />
                  Pratinjau Data ({previewData.length} Tamu)
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs underline"
                  onClick={() => setStep('mapping')}
                >
                  Ubah Mapping
                </Button>
              </div>

              <div className="max-h-[400px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Nama
                      </TableHead>
                      <TableHead className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Tipe
                      </TableHead>
                      <TableHead className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Kontak
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 100).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="py-2 text-xs font-semibold">
                          {row.full_name}
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className="px-1 text-[9px] uppercase"
                          >
                            {row.guest_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground py-2 text-[11px] leading-tight">
                          {row.phone && <div>{row.phone}</div>}
                          {row.email && (
                            <div className="italic opacity-70">{row.email}</div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {previewData.length > 100 && (
                  <div className="text-muted-foreground bg-slate-50 p-3 text-center text-xs font-medium">
                    Menampilkan 100 dari {previewData.length} tamu.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto border-t bg-slate-50/30 p-6">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() =>
                step === 'upload'
                  ? handleOpenChange(false)
                  : step === 'mapping'
                    ? setStep('upload')
                    : setStep('mapping')
              }
              disabled={isProcessing}
            >
              {step === 'upload' ? 'Batal' : 'Kembali'}
            </Button>

            {step === 'mapping' && (
              <Button onClick={applyMapping} className="min-w-[120px]">
                Lanjut ke Pratinjau
              </Button>
            )}

            {step === 'preview' && (
              <Button
                onClick={submitImport}
                disabled={isProcessing}
                className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Simpan Semua'
                )}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
