'use client'

import { useState, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { generateRandomCode } from '@/lib/utils'
import { RawGuest, ImportStep, ColumnMapping } from './types'

export function useImportGuest(eventId: string, onSuccess?: () => void) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<ImportStep>('upload')
  const [error, setError] = useState<string | null>(null)
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
    registration_number: '',
    shirt_size: '',
  })
  const [previewData, setPreviewData] = useState<RawGuest[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

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
      registration_number: '',
      shirt_size: '',
    })
    setError(null)
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
          if (
            !newMapping.registration_number &&
            (c.includes('nomor') ||
              c.includes('no.') ||
              c.includes('reg') ||
              c.includes('urut'))
          )
            newMapping.registration_number = col
          if (
            !newMapping.shirt_size &&
            (c.includes('baju') || c.includes('kaos') || c.includes('size'))
          )
            newMapping.shirt_size = col
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
        registration_number: row[columnMapping.registration_number]
          ? Number(row[columnMapping.registration_number])
          : undefined,
        shirt_size: String(row[columnMapping.shirt_size] || '').trim(),
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

      const finalPreviewData = [...previewData]

      // 1. DEDUPE WITHIN FILE (based on phone, if exists)
      const dedupeMap = new Map<string, RawGuest>()
      const noPhoneGuests: RawGuest[] = []

      finalPreviewData.forEach((g) => {
        if (!g.phone) {
          noPhoneGuests.push(g)
          return
        }
        const p = g.phone.replace(/\D/g, '')
        if (!dedupeMap.has(p)) {
          dedupeMap.set(p, g)
        }
      })

      // Unique incoming data (prioritizing phones)
      const uniqueIncomingData = [
        ...Array.from(dedupeMap.values()),
        ...noPhoneGuests,
      ]

      // 2. CHECK AGAINST DATABASE
      const phonesToCheck = Array.from(dedupeMap.keys())
      const existingGuestsMap = new Map<string, string>() // phone -> guestId

      if (phonesToCheck.length > 0) {
        // Fetch in batches of 100 to check for existing phones
        const batchSize = 100
        for (let i = 0; i < phonesToCheck.length; i += batchSize) {
          const batch = phonesToCheck.slice(i, i + batchSize)
          const { data, error: fetchError } = await supabase
            .from('guests')
            .select('id, phone')
            .in('phone', batch)

          if (fetchError) throw fetchError
          data?.forEach((eg) => {
            if (eg.phone) {
              const normalized = eg.phone.replace(/\D/g, '')
              existingGuestsMap.set(normalized, eg.id)
            }
          })
        }
      }

      // 3. SEPARATE INTO "TO CREATE" AND "TO UPDATE"
      const guestsToInsert: Record<string, unknown>[] = []
      const guestsToUpdate: Record<string, unknown>[] = []

      uniqueIncomingData.forEach((g) => {
        const normalizedPhone = g.phone ? g.phone.replace(/\D/g, '') : null
        const existingId = normalizedPhone
          ? existingGuestsMap.get(normalizedPhone)
          : null

        const guestData = {
          full_name: g.full_name,
          guest_type: ['internal', 'external', 'tenant'].includes(g.guest_type)
            ? g.guest_type
            : 'internal',
          phone: normalizedPhone,
          email: g.email || null,
          address: g.address || null,
          shirt_size: g.shirt_size || null,
        }

        if (existingId) {
          guestsToUpdate.push({
            ...guestData,
            // id: existingId, // Upsert will match by phone if we don't provide ID
          })
        } else {
          guestsToInsert.push({
            ...guestData,
            registration_source: 'admin_invite',
            rsvp_status: 'pending',
            invitation_code: `INV-${generateRandomCode(6)}`,
          })
        }
      })

      // 4. PROCESS GUESTS (Update existing, Insert new)
      const allGuestIds: string[] = []

      // 4a. Upsert existing by Phone to update profiles (like shirt_size)
      if (guestsToUpdate.length > 0) {
        const { data: updatedData, error: updateError } = await supabase
          .from('guests')
          .upsert(guestsToUpdate, {
            onConflict: 'phone',
            ignoreDuplicates: false, // We WANT to update
          })
          .select('id')

        if (updateError) throw updateError
        updatedData?.forEach((g) => allGuestIds.push(g.id))
      }

      // 4b. Insert new guests
      if (guestsToInsert.length > 0) {
        const { data: insertedData, error: insertError } = await supabase
          .from('guests')
          .insert(guestsToInsert)
          .select('id')

        if (insertError) throw insertError
        insertedData?.forEach((g) => allGuestIds.push(g.id))
      }

      // 5. LINK ALL TO EVENT
      if (allGuestIds.length > 0 && eventId) {
        const eventMappings = allGuestIds.map((id) => ({
          guest_id: id,
          event_id: eventId,
        }))

        // Use upsert on guest_events with (guest_id, event_id) as conflict columns
        const { error: mapError } = await supabase
          .from('guest_events')
          .upsert(eventMappings, {
            onConflict: 'guest_id,event_id',
            ignoreDuplicates: true,
          })

        if (mapError) throw mapError
      }

      toast.success(
        `Berhasil memproses ${allGuestIds.length} tamu. Profil diperbarui jika sudah ada.`,
      )
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
