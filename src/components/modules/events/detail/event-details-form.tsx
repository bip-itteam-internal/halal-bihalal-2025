'use client'

import React from 'react'
import { toast } from 'sonner'
import {
  CalendarIcon,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
  Layout,
  Copy,
} from 'lucide-react'
import { INVITATION_TEMPLATES as templates } from '@/lib/constants/templates'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { cn, formatJakartaDate } from '@/lib/utils'
import Image from 'next/image'
import { Event } from '@/types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

function toEventSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface EventDetailsFormProps {
  event: Event
  eventDateInput: Date | undefined
  setEventDateInput: (date: Date | undefined) => void
  onUpdateEvent: (updates: Partial<Event>) => void
  isUploadingLogo: boolean
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function EventDetailsForm({
  event,
  eventDateInput,
  setEventDateInput,
  onUpdateEvent,
  isUploadingLogo,
  onLogoUpload,
}: EventDetailsFormProps) {
  const [copied, setCopied] = React.useState(false)
  const [origin, setOrigin] = React.useState('')
  const internalLoginPath = `/guest-login/${toEventSlug(event.name || event.id)}?type=internal`
  const internalLoginUrl = origin
    ? `${origin}${internalLoginPath}`
    : internalLoginPath

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const handleCopyInternalLink = async () => {
    try {
      await navigator.clipboard.writeText(internalLoginUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // no-op
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informasi Event</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nama Event <span className="text-destructive">*</span>
                </label>

                <Input
                  placeholder="cth. Bharata Event 2026"
                  value={event.name}
                  onChange={(e) => onUpdateEvent({ name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tanggal */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tanggal Acara <span className="text-destructive">*</span>
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

                        {eventDateInput
                          ? formatJakartaDate(eventDateInput, 'PPP')
                          : 'Pilih tanggal'}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={eventDateInput}
                        onSelect={setEventDateInput}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Tipe Event */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tipe Event <span className="text-destructive">*</span>
                  </label>

                  <Select
                    value={event.event_type ?? undefined}
                    onValueChange={(val: 'internal' | 'public') =>
                      onUpdateEvent({ event_type: val })
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

                {/* Kuota External */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Kuota Eksternal <span className="text-destructive">*</span>
                  </label>

                  <Input
                    type="number"
                    min={0}
                    value={event.external_quota}
                    onChange={(e) =>
                      onUpdateEvent({
                        external_quota: Number(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                {/* Kuota Tenant */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Kuota Tenant <span className="text-destructive">*</span>
                  </label>

                  <Input
                    type="number"
                    min={0}
                    value={event.tenant_quota}
                    onChange={(e) =>
                      onUpdateEvent({
                        tenant_quota: Number(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              {/* Lokasi */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lokasi</label>

                <Input
                  placeholder="cth. Grand Ballroom"
                  value={event.location || ''}
                  onChange={(e) => onUpdateEvent({ location: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Status Registrasi</CardTitle>
            <CardDescription className="text-xs">
              Atur apakah pendaftaran publik dibuka atau ditutup.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Select
              value={event.public_reg_status}
              onValueChange={(val: 'open' | 'closed') =>
                onUpdateEvent({ public_reg_status: val })
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Pilih status registrasi" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="closed">Ditutup (Offline)</SelectItem>
                <SelectItem value="open">Dibuka (Publik)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">
              Link Login Internal (Tamu Terdaftar)
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={internalLoginUrl}
                readOnly
                className="h-9 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                onClick={handleCopyInternalLink}
              >
                <Copy className="mr-2 h-3.5 w-3.5" />
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">
              Link Pendaftaran Umum
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={
                  origin
                    ? `${origin}/register/${toEventSlug(event.name)}/eksternal`
                    : ''
                }
                readOnly
                className="h-9 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${origin}/register/${toEventSlug(event.name)}`,
                  )
                  toast.success('Link pendaftaran umum disalin!')
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">
              Link Pendaftaran Tenant
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={
                  origin
                    ? `${origin}/register/${toEventSlug(event.name)}/tenant`
                    : ''
                }
                readOnly
                className="h-9 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${origin}/register/${toEventSlug(event.name)}/tenant`,
                  )
                  toast.success('Link pendaftaran tenant disalin!')
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground text-[11px]">
            Gunakan link di atas untuk dibagikan ke calon pendaftar. Format link
            sudah menggunakan slug nama event agar lebih mudah dibaca.
          </p>
        </div>
      </div>

      <div className="space-y-6 rounded-lg border p-4">
        <div className="flex flex-col gap-6">
          <h3 className="text-sm font-semibold">Branding Dan Komunikasi</h3>
          <div className="space-y-10">
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-sans text-sm font-medium">
                <Layout className="text-primary h-4 w-4" />
                Template Invitation (Ready-to-use)
              </label>
              <Select
                value={event.template_id || 'none'}
                onValueChange={(val) =>
                  onUpdateEvent({ template_id: val === 'none' ? null : val })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih template siap pakai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Tanpa Template (Gunakan Tema Kustom)
                  </SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs leading-none font-bold">
                          {t.name}
                        </span>
                        <span className="text-[9px] leading-none opacity-60">
                          {t.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-[11px]">
                Pilih layout yang sudah jadi untuk tampilan undangan tamu.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Logo Event / Banner</label>

              <div className="flex flex-col gap-4">
                {event.logo_url ? (
                  <div className="group relative w-full max-w-[240px]">
                    <Image
                      src={event.logo_url}
                      alt="Logo Preview"
                      width={240}
                      height={135}
                      className="aspect-video w-full rounded-lg border bg-slate-50 object-contain p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => onUpdateEvent({ logo_url: '' })}
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

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onLogoUpload}
                    disabled={isUploadingLogo}
                  />
                  <div className="flex-1">
                    <Input
                      placeholder="Atau tempel URL logo di sini..."
                      value={event.logo_url || ''}
                      onChange={(e) =>
                        onUpdateEvent({ logo_url: e.target.value })
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
                Logo akan ditampilkan pada halaman pendaftaran dan undangan
                digital. Format yang disarankan: PNG/JPG dengan latar belakang
                transparan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
