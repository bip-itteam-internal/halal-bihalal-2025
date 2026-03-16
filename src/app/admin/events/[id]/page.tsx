'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { AppLayout } from '@/components/layout/app-layout'
import { getJakartaNow, toJakartaISOString } from '@/lib/utils'
import { Event } from '@/types'
import { getEventById, updateEvent, deleteEvent } from '@/services/api/events'
import { createClient } from '@/lib/supabase/client'

// Extracted Components
import { EventPageHeader } from '@/components/modules/events/detail/event-page-header'
import { EventDetailsForm } from '@/components/modules/events/detail/event-details-form'
import { EventDeleteDialog } from '@/components/modules/events/detail/event-delete-dialog'
import { EventGuestRulesManager } from '@/components/modules/events/detail/event-guest-rules-manager'

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id

  const router = useRouter()
  const supabase = createClient()

  const [deleting, setDeleting] = useState(false)
  const [event, setEvent] = useState<Event | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [eventDateInput, setEventDateInput] = useState<Date | undefined>()
  const [eventTimeInput, setEventTimeInput] = useState('08:00')
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const buildJakartaDateAndTimeInput = (value: string) => {
    const date = new Date(value)
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date)

    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
    return {
      date: new Date(Number(map.year), Number(map.month) - 1, Number(map.day)),
      time: `${map.hour}:${map.minute}`,
    }
  }

  const fetchEventDetails = useCallback(async () => {
    try {
      const data = await getEventById(eventId)
      setEvent(data)

      if (data?.event_date) {
        const { date, time } = buildJakartaDateAndTimeInput(data.event_date)
        setEventDateInput(date)
        setEventTimeInput(time)
      } else {
        const nowJakarta = getJakartaNow()
        setEventDateInput(
          new Date(
            nowJakarta.getFullYear(),
            nowJakarta.getMonth(),
            nowJakarta.getDate(),
          ),
        )
      }
    } catch (err: unknown) {
      console.error(err)
      toast.error('Gagal memuat detail kegiatan.')
    }
  }, [eventId])

  useEffect(() => {
    fetchEventDetails()
  }, [fetchEventDetails])

  const handleSaveSection = async (
    section: 'core' | 'quota' | 'links' | 'payment' | 'branding',
    updates: Partial<Event>,
    nextDate?: Date,
    nextTime?: string,
  ) => {
    if (!event) return
    try {
      const payload: Partial<Event> = { ...updates }

      if (section === 'core') {
        if (!nextDate) {
          toast.error('Tanggal acara wajib diisi.')
          return
        }

        payload.event_date = toJakartaISOString(nextDate, nextTime || '08:00')
      }

      const updated = await updateEvent(eventId, payload)

      setEvent(updated)
      if (updated.event_date) {
        const { date, time } = buildJakartaDateAndTimeInput(updated.event_date)
        setEventDateInput(date)
        setEventTimeInput(time)
      }

      toast.success(`Perubahan section ${section} berhasil disimpan.`)
      router.refresh()
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan',
      )
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteEvent(eventId)
      setIsDeleteModalOpen(false)
      toast.success('Event berhasil dihapus.')
      router.push('/admin/events')
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Gagal menghapus kegiatan.',
      )
    } finally {
      setDeleting(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !event) return

    try {
      setIsUploadingLogo(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${eventId}-${Math.random()}.${fileExt}`
      const filePath = `event-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('event-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('event-assets').getPublicUrl(filePath)

      setEvent({ ...event, logo_url: publicUrl })
      toast.success('Logo berhasil diunggah.')
    } catch (error: unknown) {
      toast.error(
        'Gagal mengunggah logo: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      )
    } finally {
      setIsUploadingLogo(false)
    }
  }

  return (
    <AppLayout
      header={
        <EventPageHeader
          name={event?.name || 'Detail Event'}
          onDelete={() => setIsDeleteModalOpen(true)}
        />
      }
    >
      <div className="flex-1 p-5 pt-4">
        <div className="mx-auto max-w-7xl space-y-6">
          {event ? (
            <>
              <EventDetailsForm
                event={event}
                eventDateInput={eventDateInput}
                setEventDateInput={setEventDateInput}
                eventTimeInput={eventTimeInput}
                setEventTimeInput={setEventTimeInput}
                onSaveSection={handleSaveSection}
                isUploadingLogo={isUploadingLogo}
                onLogoUpload={handleLogoUpload}
              />
              <EventGuestRulesManager eventId={eventId} />
            </>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-20 w-20 rounded-3xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-72" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-28 rounded-full" />
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                  <Skeleton className="h-72 rounded-2xl" />
                  <Skeleton className="h-52 rounded-2xl" />
                  <Skeleton className="h-64 rounded-2xl" />
                </div>
                <div className="space-y-6">
                  <Skeleton className="h-80 rounded-2xl" />
                  <Skeleton className="h-80 rounded-2xl" />
                </div>
              </div>
              <Skeleton className="h-80 rounded-2xl" />
            </div>
          )}
        </div>
      </div>

      <EventDeleteDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AppLayout>
  )
}
