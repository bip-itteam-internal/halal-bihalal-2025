'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/app-layout'
import { getJakartaNow, toJakartaISOString } from '@/lib/utils'
import { Event } from '@/types'
import { getEventById, updateEvent, deleteEvent } from '@/services/api/events'
import { createClient } from '@/lib/supabase/client'

// Extracted Components
import { EventPageHeader } from '@/components/modules/events/detail/event-page-header'
import { EventDetailsForm } from '@/components/modules/events/detail/event-details-form'
import { EventDeleteDialog } from '@/components/modules/events/detail/event-delete-dialog'

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id

  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
      setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEventDetails()
  }, [fetchEventDetails])

  const handleUpdate = async () => {
    if (!event) return
    if (!eventDateInput) {
      toast.error('Tanggal acara wajib diisi.')
      return
    }

    try {
      setSaving(true)
      await updateEvent(eventId, {
        name: event.name,
        event_type: event.event_type,
        description: event.description,
        event_date: toJakartaISOString(eventDateInput, eventTimeInput),
        location: event.location,
        dress_code: event.dress_code,
        external_quota: event.external_quota,
        tenant_quota: event.tenant_quota,
        public_reg_status: event.public_reg_status,
        logo_url: event.logo_url,
        template_id: event.template_id,
      })

      toast.success('Perubahan berhasil disimpan!')
      router.refresh()
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan',
      )
    } finally {
      setSaving(false)
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
        .from('assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('assets').getPublicUrl(filePath)

      setEvent({ ...event, logo_url: publicUrl })
      toast.success('Logo berhasil diunggah.')
    } catch (error: any) {
      toast.error('Gagal mengunggah logo: ' + error.message)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  return (
    <AppLayout
      header={
        <EventPageHeader
          name={event?.name || 'Detail Event'}
          onSave={handleUpdate}
          onDelete={() => setIsDeleteModalOpen(true)}
          saving={saving}
        />
      }
    >
      <div className="flex-1 space-y-6 p-5 pt-4">
        {event && (
          <EventDetailsForm
            event={event}
            eventDateInput={eventDateInput}
            setEventDateInput={setEventDateInput}
            eventTimeInput={eventTimeInput}
            setEventTimeInput={setEventTimeInput}
            onUpdateEvent={(updates) => setEvent({ ...event, ...updates })}
            isUploadingLogo={isUploadingLogo}
            onLogoUpload={handleLogoUpload}
          />
        )}
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
