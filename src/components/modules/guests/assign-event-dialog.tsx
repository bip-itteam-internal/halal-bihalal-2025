'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, CalendarPlus } from 'lucide-react'

interface AssignEventDialogProps {
  guestIds: string[]
  guestNames: string[]
  isAllMode?: boolean
  totalCount?: number
  searchFilter?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AssignEventDialog({
  guestIds,
  guestNames,
  isAllMode = false,
  totalCount = 0,
  searchFilter = '',
  isOpen,
  onOpenChange,
  onSuccess,
}: AssignEventDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [fetchingEvents, setFetchingEvents] = useState(false)

  const fetchEvents = useCallback(async () => {
    try {
      setFetchingEvents(true)
      const { data, error } = await supabase
        .from('events')
        .select('id, name')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      toast.error('Gagal memuat daftar acara.')
    } finally {
      setFetchingEvents(false)
    }
  }, [supabase])

  useEffect(() => {
    if (isOpen) {
      fetchEvents()
    }
  }, [isOpen, fetchEvents])

  const handleAssign = async () => {
    if ((!isAllMode && guestIds.length === 0) || selectedEventIds.length === 0)
      return

    try {
      setLoading(true)

      // 1. Get Unique Guest IDs
      let finalGuestIds: string[] = []
      if (isAllMode) {
        let query = supabase.from('guests').select('id')
        if (searchFilter) {
          query = query.ilike('full_name', `%${searchFilter}%`)
        }
        const { data: allGuests, error: fetchError } = await query.limit(5000)
        if (fetchError) throw fetchError
        finalGuestIds = (allGuests || []).map((g) => g.id)
      } else {
        finalGuestIds = [...guestIds]
      }

      // Deduplicate IDs just in case
      finalGuestIds = Array.from(new Set(finalGuestIds))

      if (finalGuestIds.length === 0) {
        toast.error('Tidak ada tamu yang ditemukan untuk didaftarkan.')
        return
      }

      // 2. Fetch existing assignments for ALL selected events at once (chunked)
      // This is much faster than checking event by event
      const CHUNK_SIZE = 100
      const existingKeySet = new Set<string>()

      for (let i = 0; i < finalGuestIds.length; i += CHUNK_SIZE) {
        const chunk = finalGuestIds.slice(i, i + CHUNK_SIZE)
        const { data: existing, error: checkError } = await supabase
          .from('guest_events')
          .select('guest_id, event_id')
          .in('guest_id', chunk)
          .in('event_id', selectedEventIds)

        if (checkError) throw checkError
        existing?.forEach((row) => {
          existingKeySet.add(`${row.guest_id}_${row.event_id}`)
        })
      }

      // 3. Prepare mappings, filtering out those already in existingKeySet
      const allMappings: { guest_id: string; event_id: string }[] = []
      selectedEventIds.forEach((eventId) => {
        finalGuestIds.forEach((guestId) => {
          if (!existingKeySet.has(`${guestId}_${eventId}`)) {
            allMappings.push({
              guest_id: guestId,
              event_id: eventId,
            })
          }
        })
      })

      if (allMappings.length === 0) {
        toast.info(
          'Semua tamu yang dipilih sudah terdaftar di acara-acara ini.',
        )
        onOpenChange(false)
        return
      }

      // 4. Perform bulk insert in chunks
      const INSERT_CHUNK_SIZE = 500
      let successCount = 0

      for (let i = 0; i < allMappings.length; i += INSERT_CHUNK_SIZE) {
        const chunk = allMappings.slice(i, i + INSERT_CHUNK_SIZE)
        const { error: insertError } = await supabase
          .from('guest_events')
          .insert(chunk)

        if (insertError) {
          // If we still get a duplicate error (e.g. concurrent action), try upserting as fallback
          if (insertError.code === '23505') {
            const { error: upsertError } = await supabase
              .from('guest_events')
              .upsert(chunk, { onConflict: 'guest_id,event_id' })
            if (upsertError) throw upsertError
          } else {
            throw insertError
          }
        }
        successCount += chunk.length
      }

      toast.success(
        `Berhasil mendaftarkan tamu. ${selectedEventIds.length} acara diproses, ${successCount} pendaftaran baru.`,
      )

      onOpenChange(false)
      setSelectedEventIds([])
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal mendaftarkan tamu ke acara.'
      console.error('Error assigning event:', err)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const effectiveCount = isAllMode ? totalCount : guestIds.length
  const title =
    effectiveCount > 1
      ? `Hubungkan ${effectiveCount} Tamu`
      : 'Hubungkan ke Acara'
  const description =
    effectiveCount > 1 ? (
      `Pilih satu atau lebih acara untuk ${effectiveCount} tamu yang dipilih.`
    ) : (
      <>
        Pilih acara-acara yang akan diikuti oleh{' '}
        <strong>{guestNames[0]}</strong>.
      </>
    )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            <CalendarPlus className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">
                Daftar Acara Tersedia
              </label>
              {selectedEventIds.length > 0 && (
                <span className="animate-in zoom-in rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {selectedEventIds.length} dipilih
                </span>
              )}
            </div>

            <div className="max-h-[200px] space-y-1 overflow-y-auto rounded-md border bg-slate-50/30 p-2">
              {fetchingEvents ? (
                <div className="text-muted-foreground flex h-20 items-center justify-center gap-2 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Memuat daftar acara...
                </div>
              ) : events.length === 0 ? (
                <div className="text-muted-foreground flex h-20 items-center justify-center text-xs">
                  Tidak ada acara aktif ditemukan.
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      const isSelected = selectedEventIds.includes(event.id)
                      if (isSelected) {
                        setSelectedEventIds((prev) =>
                          prev.filter((id) => id !== event.id),
                        )
                      } else {
                        setSelectedEventIds((prev) => [...prev, event.id])
                      }
                    }}
                    className={`group flex cursor-pointer items-center gap-3 rounded-md p-2 transition-all hover:bg-slate-100 ${
                      selectedEventIds.includes(event.id)
                        ? 'border-emerald-100 bg-emerald-50'
                        : 'border-transparent'
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        selectedEventIds.includes(event.id)
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selectedEventIds.includes(event.id) && (
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
                      className={`text-xs font-medium ${selectedEventIds.includes(event.id) ? 'text-emerald-700' : 'text-slate-700'}`}
                    >
                      {event.name}
                    </span>
                  </div>
                ))
              )}
            </div>
            <p className="text-muted-foreground text-[10px] italic">
              * Tamu akan dihubungkan ke semua acara yang Anda centang di atas.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedEventIds.length === 0 || loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Daftarkan Sekarang'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
