'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/app-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getJakartaNow, toJakartaISOString } from '@/lib/utils'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Event } from '@/types'

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

  const supabase = createClient()
  const router = useRouter()

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
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

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
  }, [eventId, supabase])

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

      const { error } = await supabase
        .from('events')
        .update({
          name: event.name,
          event_type: event.event_type,
          description: event.description,
          event_date: toJakartaISOString(eventDateInput, eventTimeInput),
          location: event.location,
          dress_code: event.dress_code,
          external_quota: event.external_quota,
          public_reg_status: event.public_reg_status,
          logo_url: event.logo_url,
          template_id: event.template_id,
        })
        .eq('id', eventId)

      if (error) throw error
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

      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) throw error

      setIsDeleteModalOpen(false)
      toast.success('Event berhasil dihapus.')
      router.push('/admin/events')
      router.refresh()
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menghapus event.',
      )
    } finally {
      setDeleting(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !event) return

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB.')
      return
    }

    try {
      setIsUploadingLogo(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${eventId}/${Date.now()}.${fileExt}`
      const bucketName = 'event-assets'

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('Storage bucket "event-assets" belum dibuat.')
        }
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(fileName)

      setEvent({ ...event, logo_url: publicUrl })
      toast.success('Logo berhasil diunggah.')
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Gagal mengunggah logo.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  if (loading) {
    return (
      <AppLayout header={<div className="h-14 animate-pulse bg-white/50" />}>
        <div className="flex-1 space-y-6 p-8">
          <div className="text-muted-foreground animate-pulse py-12 text-center">
            Memuat detail event...
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!event) {
    return (
      <AppLayout header={<div className="h-14" />}>
        <div className="flex-1 space-y-6 p-8">
          <div className="text-muted-foreground py-12 text-center">
            Data event tidak ditemukan.
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      header={
        <EventPageHeader
          name={event.name}
          onSave={handleUpdate}
          onDelete={() => setIsDeleteModalOpen(true)}
          saving={saving}
        />
      }
    >
      <div className="flex-1 space-y-4 p-5 pt-4">
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1.5 font-sans">
                <div className="flex items-center gap-4">
                  <CardTitle>Pengaturan Event</CardTitle>
                </div>
                <CardDescription>
                  Kelola detail informasi dan visual branding event ini.
                </CardDescription>
              </div>
              <Link href={`/admin/events/${eventId}/guests`}>
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Daftar Tamu
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
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
