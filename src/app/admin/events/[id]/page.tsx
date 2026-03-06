'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/app-layout'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  cn,
  formatJakartaDate,
  getJakartaNow,
  toJakartaISOString,
} from '@/lib/utils'
import {
  CalendarIcon,
  CircleHelp,
  Image as ImageIcon,
  Loader2,
  MoveLeft,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface EventDetail {
  id: string
  name: string
  event_type: 'internal' | 'public'
  description: string
  event_date: string
  location: string
  dress_code: string
  external_quota: number
  public_reg_status: 'open' | 'closed'
  wa_template: string
  logo_url: string
  theme_id: string | null
}

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
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isTemplateHelpOpen, setIsTemplateHelpOpen] = useState(false)
  const [eventDateInput, setEventDateInput] = useState<Date | undefined>()
  const [eventTimeInput, setEventTimeInput] = useState('08:00')
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const renderPageHeader = (title: string, description?: string) => (
    <div className="flex items-center gap-3 px-4 py-2">
      <Link href="/admin/events">
        <Button variant="outline" size="sm" className="h-7 w-7">
          <MoveLeft className="h-3.5 w-3.5" />
        </Button>
      </Link>
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-[10px] leading-tight">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )

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
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
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
          wa_template: event.wa_template,
          logo_url: event.logo_url,
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

    // Simple validation
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      toast.error('Ukuran file maksimal 2MB.')
      return
    }

    try {
      setIsUploadingLogo(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${eventId}/${Date.now()}.${fileExt}`
      const bucketName = 'event-assets'

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          throw new Error(
            'Storage bucket "event-assets" belum dibuat. Silakan hubungi admin.',
          )
        }
        throw uploadError
      }

      // Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(fileName)

      setEvent({ ...event, logo_url: publicUrl })
      toast.success('Logo berhasil diunggah.')
    } catch (err: unknown) {
      const error = err as Error
      console.error(error)
      toast.error(error.message || 'Gagal mengunggah logo.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  if (loading) {
    return (
      <AppLayout
        header={renderPageHeader(
          'Kelola Event',
          'Memuat detail event dan pengaturan terkait.',
        )}
      >
        <div className="flex-1 space-y-6 p-8">
          <div className="text-muted-foreground py-12 text-center">
            Memuat detail event...
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!event) {
    return (
      <AppLayout header={renderPageHeader('Event Tidak Ditemukan')}>
        <div className="flex-1 space-y-6 p-8">
          <div className="text-muted-foreground py-12 text-center">
            Data event tidak ditemukan atau sudah dihapus.
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      header={renderPageHeader(
        `${event.name}`,
        'Lengkapi dan perbarui pengaturan khusus untuk event ini.',
      )}
    >
      <div className="flex-1 space-y-4 p-5 pt-4">
        {/* Tabs Navigation */}
        <div className="flex border-b">
          <Link
            href={`/admin/events/${eventId}`}
            className="border-primary border-b-2 px-4 py-2 text-sm font-medium"
          >
            Pengaturan
          </Link>
          <Link
            href={`/admin/events/${eventId}/guests`}
            className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium"
          >
            Daftar Tamu
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Detail Utama Form */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Utama Ekstra</CardTitle>
              <CardDescription>
                Atur detail event, status publikasi, tautan logo banner, dan
                template WA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleUpdate}
                className="grid grid-cols-2 items-start gap-6"
              >
                <div className="space-y-6 rounded-lg border p-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Informasi Event</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm leading-none font-medium">
                          Nama Event <span className="text-destructive">*</span>
                        </label>
                        <Input
                          placeholder="cth. Halal Bihalal 2026"
                          value={event.name}
                          onChange={(e) =>
                            setEvent({ ...event, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm leading-none font-medium">
                          Deskripsi
                        </label>
                        <Textarea
                          placeholder="Deskripsi singkat event"
                          className="min-h-[90px]"
                          value={event.description || ''}
                          onChange={(e) =>
                            setEvent({
                              ...event,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-sm font-semibold">Jadwal Dan Lokasi</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm leading-none font-medium">
                            Tanggal Acara{' '}
                            <span className="text-destructive">*</span>
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !eventDateInput && 'text-muted-foreground',
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {eventDateInput ? (
                                  formatJakartaDate(eventDateInput, 'PPP')
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={eventDateInput}
                                onSelect={setEventDateInput}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm leading-none font-medium">
                            Waktu Acara{' '}
                            <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="time"
                            value={eventTimeInput}
                            onChange={(e) => setEventTimeInput(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm leading-none font-medium">
                          Lokasi
                        </label>
                        <Input
                          placeholder="cth. Grand Ballroom"
                          value={event.location || ''}
                          onChange={(e) =>
                            setEvent({ ...event, location: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm leading-none font-medium">
                          Dress Code
                        </label>
                        <Input
                          placeholder="cth. Smart Casual / Batik"
                          value={event.dress_code || ''}
                          onChange={(e) =>
                            setEvent({ ...event, dress_code: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 rounded-lg border p-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Publikasi</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm leading-none font-medium">
                          Tipe Event <span className="text-destructive">*</span>
                        </label>
                        <Select
                          value={event.event_type}
                          onValueChange={(val: 'internal' | 'public') =>
                            setEvent({ ...event, event_type: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe event" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="public">Publik</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm leading-none font-medium">
                          Status Pendaftaran Publik{' '}
                          <span className="text-destructive">*</span>
                        </label>
                        <Select
                          value={event.public_reg_status}
                          onValueChange={(val: 'open' | 'closed') =>
                            setEvent({ ...event, public_reg_status: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status pendaftaran" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="closed">
                              Ditutup (Tertutup)
                            </SelectItem>
                            <SelectItem value="open">
                              Dibuka (Publik bisa daftar)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm leading-none font-medium">
                          Kuota Eksternal{' '}
                          <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={event.external_quota}
                          onChange={(e) =>
                            setEvent({
                              ...event,
                              external_quota: Number(e.target.value) || 0,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-sm font-semibold">
                      Branding Dan Komunikasi
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-4">
                        <label className="text-sm leading-none font-medium">
                          Logo Event / Banner
                        </label>

                        <div className="flex flex-col gap-4">
                          {event.logo_url ? (
                            <div className="group relative w-full max-w-[200px]">
                              <Image
                                src={event.logo_url}
                                alt="Logo Preview"
                                width={120}
                                height={68}
                                className="aspect-video w-full rounded-lg border bg-slate-50 object-contain p-2"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() =>
                                  setEvent({ ...event, logo_url: '' })
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="flex aspect-video w-full max-w-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50/50 transition-colors hover:bg-slate-50"
                              onClick={() =>
                                document.getElementById('logo-upload')?.click()
                              }
                            >
                              <ImageIcon className="mb-2 h-8 w-8 text-slate-300" />
                              <p className="text-[10px] font-medium text-slate-400">
                                Pilih Logo (Max 2MB)
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoUpload}
                              disabled={isUploadingLogo}
                            />
                            <div className="flex-1">
                              <Input
                                placeholder="Atau tempel URL logo di sini..."
                                value={event.logo_url || ''}
                                onChange={(e) =>
                                  setEvent({
                                    ...event,
                                    logo_url: e.target.value,
                                  })
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() =>
                                document.getElementById('logo-upload')?.click()
                              }
                              disabled={isUploadingLogo}
                            >
                              {isUploadingLogo ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Upload className="mr-2 h-3 w-3" />
                              )}
                              Upload
                            </Button>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-[10px] leading-tight opacity-70">
                          Logo akan ditampilkan pada halaman pendaftaran dan
                          undangan digital. Format yang disarankan: PNG/JPG
                          dengan latar belakang transparan.
                        </p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-sm leading-none font-medium">
                            Format Pesan WhatsApp (Template)
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsTemplateHelpOpen(true)}
                          >
                            <CircleHelp className="mr-2 h-4 w-4" />
                            Help
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Halo [nama_tamu], ini kode QR Anda: [qr_link] dsb..."
                          className="min-h-[120px]"
                          value={event.wa_template || ''}
                          onChange={(e) =>
                            setEvent({
                              ...event,
                              wa_template: e.target.value,
                            })
                          }
                        />
                        <p className="text-muted-foreground text-xs">
                          Gunakan variabel (mis. {'{guest_name}'}, {'{qr_link}'}
                          ) yang akan diganti secara otomatis nantinya
                          (sesuaikan dengan dukungan backend).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t pt-4 lg:col-span-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Event
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      'Menyimpan...'
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Event?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak bisa dibatalkan. Seluruh data turunan event
              (seperti tamu, check-in, dan izin terkait) juga akan terhapus.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTemplateHelpOpen} onOpenChange={setIsTemplateHelpOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bantuan Format Pesan WhatsApp</DialogTitle>
            <DialogDescription>
              Gunakan variabel agar isi pesan bisa diganti otomatis saat
              pengiriman.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Variabel yang umum dipakai</p>
              <div className="rounded-md border p-3">
                <p>
                  <code>{'{guest_name}'}</code> nama tamu
                </p>
                <p>
                  <code>{'{event_name}'}</code> nama event
                </p>
                <p>
                  <code>{'{event_date}'}</code> tanggal acara
                </p>
                <p>
                  <code>{'{event_location}'}</code> lokasi acara
                </p>
                <p>
                  <code>{'{qr_link}'}</code> tautan QR tamu
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Contoh template</p>
              <div className="bg-muted rounded-md border p-3 font-mono text-xs whitespace-pre-wrap">
                {`Halo {guest_name},

Undangan untuk acara {event_name} pada {event_date} di {event_location}.

Silakan tunjukkan QR berikut saat check-in:
{qr_link}

Terima kasih.`}
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Contoh hasil</p>
              <div className="rounded-md border p-3 whitespace-pre-wrap">
                {`Halo Budi Santoso,

Undangan untuk acara Halal Bihalal 2026 pada 31 Maret 2026 pukul 19.30 WIB di Grand Ballroom.

Silakan tunjukkan QR berikut saat check-in:
https://contoh.app/qr/ABC123

Terima kasih.`}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setIsTemplateHelpOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
