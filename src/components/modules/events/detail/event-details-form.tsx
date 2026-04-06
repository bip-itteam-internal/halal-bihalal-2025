'use client'

import React from 'react'
import { toast } from 'sonner'
import {
  BadgeCheck,
  CalendarIcon,
  Clock3,
  Copy,
  Image as ImageIcon,
  Layout,
  Loader2,
  MapPin,
  Megaphone,
  Pencil,
  ShieldCheck,
  Ticket,
  Upload,
  Users,
  Wallet,
  X,
  Navigation,
} from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(() => import('./map-picker'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-slate-100 italic text-slate-400">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Memuat Peta...
    </div>
  ),
})

import { INVITATION_TEMPLATES as templates } from '@/lib/constants/templates'
import { cn, formatJakartaDate } from '@/lib/utils'
import { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

function toEventSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

type EditableSection = 'core' | 'quota' | 'links' | 'payment' | 'branding' | null

interface EventDetailsFormProps {
  event: Event
  eventDateInput: Date | undefined
  setEventDateInput: (date: Date | undefined) => void
  eventTimeInput: string
  setEventTimeInput: (time: string) => void
  onSaveSection: (
    section: Exclude<EditableSection, null>,
    updates: Partial<Event>,
    nextDate?: Date,
    nextTime?: string,
  ) => Promise<void>
  isUploadingLogo: boolean
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function SectionCard({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-2xl border-slate-200 py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              {icon}
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base text-slate-950">{title}</CardTitle>
              {description ? (
                <CardDescription className="text-xs leading-relaxed text-slate-500">
                  {description}
                </CardDescription>
              ) : null}
            </div>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:px-5">{children}</CardContent>
    </Card>
  )
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {children}
      {required ? <span className="text-destructive"> *</span> : null}
    </label>
  )
}

function InfoPill({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
      {icon}
      <span className="truncate">{children}</span>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
        {label}
      </p>
      <div className="text-sm font-medium text-slate-900">{value}</div>
    </div>
  )
}

export function EventDetailsForm(props: EventDetailsFormProps) {
  const {
    event,
    eventDateInput,
    setEventDateInput,
    eventTimeInput,
    setEventTimeInput,
    onSaveSection,
    isUploadingLogo,
    onLogoUpload,
  } = props

  const [copied, setCopied] = React.useState(false)
  const [origin, setOrigin] = React.useState('')
  const [activeSection, setActiveSection] = React.useState<EditableSection>(null)
  const [draftEvent, setDraftEvent] = React.useState<Event>(event)
  const [draftDateInput, setDraftDateInput] = React.useState<Date | undefined>(
    eventDateInput,
  )
  const [draftTimeInput, setDraftTimeInput] = React.useState(eventTimeInput)

  const slug = toEventSlug(event.name || event.id)
  const internalLoginPath = `/guest-login/${slug}?type=internal`
  const internalLoginUrl = origin ? `${origin}${internalLoginPath}` : internalLoginPath
  const publicRegisterUrl = origin ? `${origin}/register/${slug}/eksternal` : ''

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  React.useEffect(() => {
    setDraftEvent(event)
  }, [event])

  React.useEffect(() => {
    setDraftDateInput(eventDateInput)
  }, [eventDateInput])

  React.useEffect(() => {
    setDraftTimeInput(eventTimeInput)
  }, [eventTimeInput])

  const openSection = (section: EditableSection) => {
    setDraftEvent(event)
    setDraftDateInput(eventDateInput)
    setDraftTimeInput(eventTimeInput)
    setActiveSection(section)
  }

  const applyDraft = async () => {
    if (!activeSection) return

    const updatesBySection: Record<
      Exclude<EditableSection, null>,
      Partial<Event>
    > = {
      core: {
        name: draftEvent.name,
        event_type: draftEvent.event_type,
        location: draftEvent.location,
        latitude: draftEvent.latitude,
        longitude: draftEvent.longitude,
      },
      quota: {
        external_quota: draftEvent.external_quota,
      },
      links: {
        name: draftEvent.name,
      },
      payment: {
        public_reg_status: draftEvent.public_reg_status,
        is_paid: draftEvent.is_paid,
        price_external: draftEvent.price_external,
        payment_info: draftEvent.payment_info,
      },
      branding: {
        template_id: draftEvent.template_id,
        logo_url: draftEvent.logo_url,
      },
    }

    await onSaveSection(
      activeSection,
      updatesBySection[activeSection],
      draftDateInput,
      draftTimeInput,
    )

    if (activeSection === 'core') {
      setEventDateInput(draftDateInput)
      setEventTimeInput(draftTimeInput)
    }

    setActiveSection(null)
  }

  const fallbackCopyText = (value: string) => {
    if (typeof document === 'undefined') return false
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    let copiedValue = false
    try {
      copiedValue = document.execCommand('copy')
    } catch {
      copiedValue = false
    }
    document.body.removeChild(textarea)
    return copiedValue
  }

  const copyText = async (value: string, message: string, withToggle = false) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else if (!fallbackCopyText(value)) {
        throw new Error('Clipboard API unavailable')
      }
      if (withToggle) {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } else {
        toast.success(message)
      }
    } catch {
      if (fallbackCopyText(value)) {
        if (withToggle) {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } else {
          toast.success(message)
        }
        return
      }
      toast.error('Gagal menyalin link.')
    }
  }

  const editButton = (section: EditableSection) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 shrink-0"
      onClick={() => openSection(section)}
    >
      <Pencil className="mr-2 h-3.5 w-3.5" />
      Edit
    </Button>
  )

  return (
    <div className="space-y-6">
      <SectionCard
        icon={<BadgeCheck className="h-5 w-5" />}
        title="Ringkasan Event"
        description="Cek identitas event, status publikasi, dan gambaran singkat sebelum melakukan perubahan."
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white">
              {event.logo_url ? (
                <Image
                  src={event.logo_url}
                  alt={`Logo ${event.name}`}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-300" />
              )}
            </div>

            <div className="min-w-0 space-y-3">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={
                      event.event_type === 'public'
                        ? 'border-sky-200 bg-sky-50 text-sky-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }
                  >
                    {event.event_type === 'public' ? 'Event Publik' : 'Event Internal'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      event.public_reg_status === 'open'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }
                  >
                    Registrasi {event.public_reg_status === 'open' ? 'Buka' : 'Tutup'}
                  </Badge>
                  {event.template_id ? (
                    <Badge
                      variant="outline"
                      className="border-violet-200 bg-violet-50 text-violet-700"
                    >
                      Template Aktif
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                    {event.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Kelola detail publikasi, link distribusi, pembayaran, dan branding
                    event dari satu halaman.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:flex sm:flex-wrap">
                <InfoPill icon={<CalendarIcon className="h-3.5 w-3.5" />}>
                  {eventDateInput
                    ? formatJakartaDate(eventDateInput, 'PPP')
                    : 'Tanggal belum diatur'}
                </InfoPill>
                <InfoPill icon={<Clock3 className="h-3.5 w-3.5" />}>
                  {eventTimeInput || '08:00'} WIB
                </InfoPill>
                <InfoPill icon={<MapPin className="h-3.5 w-3.5" />}>
                  {event.location || 'Lokasi belum diisi'}
                </InfoPill>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:max-w-xs">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Kuota Umum
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {event.external_quota ?? 0}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <SectionCard
            icon={<Ticket className="h-5 w-5" />}
            title="Informasi Inti"
            description="Identitas utama event yang tampil di halaman publik dan undangan."
            action={editButton('core')}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailItem label="Nama Event" value={event.name} />
              <DetailItem
                label="Tipe Event"
                value={event.event_type === 'public' ? 'Publik' : 'Internal'}
              />
              <DetailItem
                label="Tanggal Acara"
                value={
                  eventDateInput
                    ? formatJakartaDate(eventDateInput, 'PPP')
                    : 'Belum diatur'
                }
              />
              <div className="sm:col-span-2">
                <DetailItem label="Lokasi" value={event.location || 'Belum diisi'} />
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-emerald-500" />
                <DetailItem
                  label="Latitude"
                  value={event.latitude?.toString() || 'Belum diatur'}
                />
              </div>
              <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                <Navigation className="h-4 w-4 text-emerald-500" />
                <DetailItem
                  label="Longitude"
                  value={event.longitude?.toString() || 'Belum diatur'}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<Users className="h-5 w-5" />}
            title="Kuota Publik"
            description="Kuota pendaftaran publik untuk jalur umum."
            action={editButton('quota')}
          >
            <div className="grid gap-5">
              <DetailItem label="Kuota Eksternal" value={event.external_quota ?? 0} />
            </div>
          </SectionCard>

          <SectionCard
            icon={<Megaphone className="h-5 w-5" />}
            title="Link Distribusi"
            description="Gunakan link berikut untuk login internal dan jalur pendaftaran publik."
            action={editButton('links')}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <FieldLabel>Login Internal</FieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input value={internalLoginUrl} readOnly className="h-9 min-w-0 text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-full shrink-0 sm:w-auto"
                    onClick={() =>
                      copyText(internalLoginUrl, 'Link login internal disalin!', true)
                    }
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel>Pendaftaran Umum</FieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input value={publicRegisterUrl} readOnly className="h-9 min-w-0 text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-full shrink-0 sm:w-auto"
                    onClick={() =>
                      copyText(publicRegisterUrl, 'Link pendaftaran umum disalin!')
                    }
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>


            </div>
          </SectionCard>
        </div>
        <div className="space-y-6">
          <SectionCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Registrasi & Pembayaran"
            description="Status pendaftaran publik dan kebutuhan pembayaran untuk tiap jalur tamu."
            action={editButton('payment')}
          >
            <div className="grid gap-5">
              <DetailItem
                label="Status Registrasi Publik"
                value={event.public_reg_status === 'open' ? 'Dibuka' : 'Ditutup'}
              />
              <DetailItem
                label="Tamu Umum Berbayar"
                value={event.is_paid ? 'Aktif' : 'Tidak aktif'}
              />
              <DetailItem
                label="Harga Tiket Umum"
                value={`Rp ${Number(event.price_external || 0).toLocaleString('id-ID')}`}
              />
              <DetailItem
                label="Info Pembayaran"
                value={
                  <div className="whitespace-pre-line text-sm font-medium text-slate-900">
                    {event.payment_info || 'Belum diisi'}
                  </div>
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={<Layout className="h-5 w-5" />}
            title="Branding & Template"
            description="Template invitation dan identitas visual event."
            action={editButton('branding')}
          >
            <div className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {event.logo_url ? (
                  <Image
                    src={event.logo_url}
                    alt="Logo Preview"
                    width={640}
                    height={360}
                    className="aspect-video w-full object-contain p-4"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="grid gap-5">
                <DetailItem
                  label="Template Invitation"
                  value={
                    templates.find((item) => item.id === event.template_id)?.name ||
                    'Tanpa template'
                  }
                />
                <DetailItem
                  label="Logo URL"
                  value={
                    event.logo_url ? (
                      <span className="break-all">{event.logo_url}</span>
                    ) : (
                      'Belum diisi'
                    )
                  }
                />
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <Sheet
        open={activeSection !== null}
        onOpenChange={(open) => !open && setActiveSection(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>
              {activeSection === 'core' && 'Edit Informasi Inti'}
              {activeSection === 'quota' && 'Edit Kuota Publik'}
              {activeSection === 'links' && 'Edit Link Distribusi'}
              {activeSection === 'payment' && 'Edit Registrasi & Pembayaran'}
              {activeSection === 'branding' && 'Edit Branding & Template'}
            </SheetTitle>
            <SheetDescription>
              Lakukan perubahan pada section ini, lalu simpan untuk menerapkan ke halaman detail event.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 px-5 py-5">
            {activeSection === 'core' && (
              <>
                <div className="space-y-2">
                  <FieldLabel required>Nama Event</FieldLabel>
                  <Input
                    value={draftEvent.name}
                    onChange={(e) =>
                      setDraftEvent((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel required>Tanggal Acara</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !draftDateInput && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {draftDateInput
                            ? formatJakartaDate(draftDateInput, 'PPP')
                            : 'Pilih tanggal'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={draftDateInput}
                          onSelect={setDraftDateInput}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel required>Tipe Event</FieldLabel>
                    <Select
                      value={draftEvent.event_type ?? undefined}
                      onValueChange={(val: 'internal' | 'public') =>
                        setDraftEvent((prev) => ({ ...prev, event_type: val }))
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
                  <div className="space-y-2 sm:col-span-2">
                    <FieldLabel>Lokasi</FieldLabel>
                    <Input
                      value={draftEvent.location || ''}
                      onChange={(e) =>
                        setDraftEvent((prev) => ({ ...prev, location: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Latitude</FieldLabel>
                    <Input
                      type="number"
                      step="any"
                      placeholder="-6.123456"
                      value={draftEvent.latitude ?? ''}
                      onChange={(e) =>
                        setDraftEvent((prev) => ({
                          ...prev,
                          latitude: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Longitude</FieldLabel>
                    <Input
                      type="number"
                      step="any"
                      placeholder="106.123456"
                      value={draftEvent.longitude ?? ''}
                      onChange={(e) =>
                        setDraftEvent((prev) => ({
                          ...prev,
                          longitude: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <FieldLabel>Pilih di Peta</FieldLabel>
                    <MapPicker
                      lat={draftEvent.latitude || null}
                      lng={draftEvent.longitude || null}
                      onChange={(lat, lng) =>
                        setDraftEvent((prev) => ({
                          ...prev,
                          latitude: parseFloat(lat.toFixed(6)),
                          longitude: parseFloat(lng.toFixed(6)),
                        }))
                      }
                    />
                    <p className="text-[10px] text-slate-500">
                      Klik pada peta untuk memindahkan penanda lokasi acara secara presisi.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'quota' && (
               <div className="grid gap-4">
                <div className="space-y-2">
                  <FieldLabel required>Kuota Eksternal</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    value={draftEvent.external_quota}
                    onChange={(e) =>
                      setDraftEvent((prev) => ({
                        ...prev,
                        external_quota: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {activeSection === 'links' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
                  Link distribusi mengikuti slug nama event. Jika nama event diubah, link akan ikut berubah otomatis.
                </div>
                <div className="space-y-2">
                  <FieldLabel>Nama Event untuk Slug</FieldLabel>
                  <Input
                    value={draftEvent.name}
                    onChange={(e) =>
                      setDraftEvent((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}

            {activeSection === 'payment' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <FieldLabel>Status Registrasi Publik</FieldLabel>
                  <Select
                    value={draftEvent.public_reg_status}
                    onValueChange={(val: 'open' | 'closed') =>
                      setDraftEvent((prev) => ({ ...prev, public_reg_status: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status registrasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="closed">Ditutup</SelectItem>
                      <SelectItem value="open">Dibuka</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Tamu umum berbayar</p>
                      <p className="text-xs leading-relaxed text-slate-500">
                        Aktifkan jika pendaftaran eksternal memerlukan bukti pembayaran.
                      </p>
                    </div>
                    <Switch
                      checked={!!draftEvent.is_paid}
                      onCheckedChange={(checked) =>
                        setDraftEvent((prev) => ({ ...prev, is_paid: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel>Harga Tiket Umum</FieldLabel>
                  <div className="relative">
                    <Wallet className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="number"
                      min={0}
                      value={draftEvent.price_external ?? 0}
                      onChange={(e) =>
                        setDraftEvent((prev) => ({
                          ...prev,
                          price_external: Number(e.target.value) || 0,
                        }))
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Info Pembayaran</FieldLabel>
                  <Textarea
                    value={draftEvent.payment_info || ''}
                    onChange={(e) =>
                      setDraftEvent((prev) => ({ ...prev, payment_info: e.target.value }))
                    }
                    className="min-h-28 resize-y"
                  />
                </div>
              </div>
            )}

            {activeSection === 'branding' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <FieldLabel>Template Invitation</FieldLabel>
                  <Select
                    value={draftEvent.template_id || 'none'}
                    onValueChange={(val) =>
                      setDraftEvent((prev) => ({
                        ...prev,
                        template_id: val === 'none' ? null : val,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih template siap pakai" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        Tanpa Template (Gunakan Tema Kustom)
                      </SelectItem>
                      {templates.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <FieldLabel>Logo Event / Banner</FieldLabel>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {draftEvent.logo_url ? (
                      <Image
                        src={draftEvent.logo_url}
                        alt="Logo Preview"
                        width={640}
                        height={360}
                        className="aspect-video w-full object-contain p-4"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onLogoUpload}
                    disabled={isUploadingLogo}
                  />
                  <Input
                    placeholder="Atau tempel URL logo di sini..."
                    value={draftEvent.logo_url || ''}
                    onChange={(e) =>
                      setDraftEvent((prev) => ({ ...prev, logo_url: e.target.value }))
                    }
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={isUploadingLogo}
                    >
                      {isUploadingLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="px-3"
                      onClick={() => setDraftEvent((prev) => ({ ...prev, logo_url: '' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="border-t px-5 py-4">
            <Button type="button" variant="outline" onClick={() => setActiveSection(null)}>
              Batal
            </Button>
            <Button type="button" onClick={() => void applyDraft()}>
              Simpan Section
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
