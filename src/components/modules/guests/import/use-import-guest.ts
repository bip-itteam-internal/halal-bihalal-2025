'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { generateRandomCode } from '@/lib/utils'
import { RawGuest, ImportStep, ColumnMapping, EventOption } from './types'

export function useImportGuest(eventId: string, onSuccess?: () => void) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<ImportStep>('upload')
  const [error, setError] = useState<string | null>(null)

  // Events Selection state
  const [events, setEvents] = useState<EventOption[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [defaultGuestType, setDefaultGuestType] =
    useState<RawGuest['guest_type']>('internal')
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  // Data State
  const [rawFileData, setRawFileData] = useState<Record<string, unknown>[]>([])
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    full_name: '',
    guest_type: '',
    phone: '',
    email: '',
    address: '',
  })
  const [previewData, setPreviewData] = useState<RawGuest[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchEvents = useCallback(async () => {
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
  }, [supabase])

  useEffect(() => {
    if (isOpen && !eventId) {
      fetchEvents()
    }
  }, [isOpen, eventId, fetchEvents])

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
    setDefaultGuestType('internal')
    setSkipDuplicates(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
        toast.success(
          `File "${file.name}" berhasil dibaca. Silahkan pilih event sebelum lanjut.`,
        )
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
      .map((row) => ({
        full_name: String(row[columnMapping.full_name] || '').trim(),
        guest_type:
          (String(
            row[columnMapping.guest_type] || '',
          ).toLowerCase() as RawGuest['guest_type']) || defaultGuestType,
        phone: String(row[columnMapping.phone] || '').trim(),
        email: String(row[columnMapping.email] || '').trim(),
        address: String(row[columnMapping.address] || '').trim(),
      }))
      .filter((g) => g.full_name !== '')

    setPreviewData(mapped)
    setStep('preview')
    setError(null)
  }

  const updatePreviewRow = (
    idx: number,
    field: keyof RawGuest,
    value: string,
  ) => {
    setPreviewData((prev) => {
      const newData = [...prev]
      newData[idx] = { ...newData[idx], [field]: value }
      return newData
    })
  }

  const duplicateMap = new Map<string, number>()
  previewData.forEach((g) => {
    if (g.phone) duplicateMap.set(g.phone, (duplicateMap.get(g.phone) || 0) + 1)
  })
  const hasDuplicates =
    !skipDuplicates &&
    Array.from(duplicateMap.values()).some((count) => count > 1)

  const fileUniqueCount = useMemo(() => {
    if (!skipDuplicates) return previewData.length
    const seen = new Set()
    return previewData.filter((g) => {
      if (!g.phone) return true
      const p = g.phone.replace(/\D/g, '')
      if (seen.has(p)) return false
      seen.add(p)
      return true
    }).length
  }, [previewData, skipDuplicates])

  const submitImport = async () => {
    if (previewData.length === 0 || hasDuplicates) return

    try {
      setIsProcessing(true)

      let finalPreviewData = [...previewData]

      // Filter duplicates within the file if skipping
      if (skipDuplicates) {
        const seen = new Set()
        finalPreviewData = finalPreviewData.filter((g) => {
          if (!g.phone) return true
          const p = g.phone.replace(/\D/g, '')
          if (seen.has(p)) return false
          seen.add(p)
          return true
        })
      }

      // Check against database if skipping
      if (skipDuplicates) {
        const phonesToCheck = finalPreviewData
          .map((g) => g.phone?.replace(/\D/g, ''))
          .filter(Boolean) as string[]

        if (phonesToCheck.length > 0) {
          const { data: existing } = await supabase
            .from('guests')
            .select('phone')
            .in('phone', phonesToCheck)

          if (existing && existing.length > 0) {
            const existingPhones = new Set(
              existing.map((e) => e.phone?.replace(/\D/g, '')),
            )
            finalPreviewData = finalPreviewData.filter((g) => {
              const p = g.phone?.replace(/\D/g, '')
              return !p || !existingPhones.has(p)
            })
          }
        }
      }

      if (finalPreviewData.length === 0) {
        toast.info(
          'Semua data tamu sudah terdaftar, tidak ada data baru yang ditambahkan.',
        )
        setIsOpen(false)
        resetState()
        return
      }

      const guestsToInsert = finalPreviewData.map((g) => ({
        full_name: g.full_name,
        guest_type: ['internal', 'external'].includes(g.guest_type)
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
              mappings.push({ guest_id: ig.id, event_id: eid })
            })
          })

        if (mappings.length > 0) {
          const { error: mapError } = await supabase
            .from('guest_events')
            .insert(mappings)
          if (mapError) throw mapError
        }
      }

      toast.success('Daftar tamu berhasil diimpor!')
      setIsOpen(false)
      resetState()
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengimpor data tamu.'
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isOpen,
    setIsOpen,
    step,
    setStep,
    isProcessing,
    error,
    events,
    selectedEventIds,
    setSelectedEventIds,
    loadingEvents,
    rawFileData,
    availableColumns,
    columnMapping,
    setColumnMapping,
    previewData,
    updatePreviewRow,
    duplicateMap,
    hasDuplicates,
    fileUniqueCount,
    defaultGuestType,
    setDefaultGuestType,
    skipDuplicates,
    setSkipDuplicates,
    fileInputRef,
    handleFileUpload,
    applyMapping,
    submitImport,
    resetState,
  }
}
