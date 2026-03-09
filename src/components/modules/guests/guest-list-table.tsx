'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  UserPen,
  Link as LinkIcon,
  FileImage,
  Check,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Guest } from '@/types'
import slugify from 'slugify'
import { encodeUUID } from '@/lib/utils'

interface GuestListTableProps {
  guests: Guest[]
  eventName?: string
  onRefresh: () => void
  startNumber?: number
}

export function GuestListTable({
  guests,
  eventName,
  onRefresh,
  startNumber = 1,
}: GuestListTableProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpdatePaymentStatus = async (
    guestId: string,
    eventId: string,
    status: 'verified' | 'rejected',
  ) => {
    try {
      setLoading(guestId)

      // 1. Update Payment Status in guest_events
      const { error: paymentErr } = await supabase
        .from('guest_events')
        .update({ payment_status: status })
        .eq('guest_id', guestId)
        .eq('event_id', eventId)

      if (paymentErr) throw paymentErr

      // 2. If verified, update RSVP status to confirmed
      if (status === 'verified') {
        const { error: rsvpErr } = await supabase
          .from('guests')
          .update({ rsvp_status: 'confirmed' })
          .eq('id', guestId)

        if (rsvpErr) throw rsvpErr
      }

      toast.success(
        status === 'verified'
          ? 'Pembayaran berhasil diverifikasi.'
          : 'Pembayaran ditolak.',
      )
      onRefresh()
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Gagal merubah status pembayaran.')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tamu ini?')) return

    try {
      setLoading(id)
      const { error } = await supabase.from('guests').delete().eq('id', id)
      if (error) throw error
      toast.success('Tamu berhasil dihapus.')
      onRefresh()
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Gagal menghapus tamu.')
    } finally {
      setLoading(null)
    }
  }

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500 bg-emerald-500/10 px-1.5 py-0 text-[10px] font-bold text-emerald-600 uppercase"
          >
            TERVERIFIKASI
          </Badge>
        )
      case 'rejected':
        return (
          <Badge
            variant="outline"
            className="border-destructive text-destructive bg-destructive/10 gap-1 px-1.5 py-0 text-[10px] font-bold uppercase"
          >
            DITOLAK
          </Badge>
        )
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500 bg-amber-500/10 px-1.5 py-0 text-[10px] font-bold text-amber-600 uppercase"
          >
            PENDING
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500 bg-emerald-50 px-1.5 py-0 text-[10px] font-bold text-emerald-600 uppercase"
          >
            <CheckCircle2 className="h-3 w-3" /> Berhasil
          </Badge>
        )
      case 'declined':
        return (
          <Badge
            variant="outline"
            className="border-destructive text-destructive bg-destructive/5 gap-1 px-1.5 py-0 text-[10px] font-bold uppercase"
          >
            <XCircle className="h-3 w-3" /> Ditolak
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500 bg-amber-50 px-1.5 py-0 text-[10px] font-bold text-amber-600 uppercase"
          >
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
    }
  }

  const getGuestTypeLabel = (type: string) => {
    switch (type) {
      case 'internal':
        return (
          <Badge
            variant="secondary"
            className="text-[9px] font-normal uppercase"
          >
            Internal
          </Badge>
        )
      case 'external':
        return (
          <Badge variant="outline" className="text-[9px] font-normal uppercase">
            Eksternal
          </Badge>
        )
      case 'tenant':
        return (
          <Badge
            variant="outline"
            className="border-purple-200 bg-purple-50 text-[9px] font-normal text-purple-700 uppercase"
          >
            Tenant
          </Badge>
        )
      default:
        return type
    }
  }

  return (
    <div className="overflow-hidden rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="w-[60px] text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
              No
            </TableHead>
            <TableHead className="w-[200px] text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Nama Tamu
            </TableHead>
            <TableHead className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Tipe
            </TableHead>
            <TableHead className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Kontak
            </TableHead>
            <TableHead className="text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Status RSVP
            </TableHead>
            <TableHead className="text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Bayar
            </TableHead>
            <TableHead className="text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Bukti Bayar
            </TableHead>
            <TableHead className="pr-6 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-muted-foreground h-32 text-center"
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-lg font-medium">Belum ada tamu</span>
                  <p className="text-sm">
                    Silakan tambahkan tamu baru atau impor data.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            guests.map((guest, index) => (
              <TableRow
                key={guest.id}
                className="transition-colors hover:bg-slate-50/50"
              >
                <TableCell className="text-center text-sm font-semibold text-slate-600">
                  {startNumber + index}
                </TableCell>
                <TableCell className="py-3 font-medium">
                  {guest.full_name}
                </TableCell>
                <TableCell>{getGuestTypeLabel(guest.guest_type)}</TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-0.5 text-[11px] leading-tight">
                    {guest.phone && (
                      <span className="font-medium text-slate-700">
                        {guest.phone}
                      </span>
                    )}
                    {guest.email && (
                      <span className="text-muted-foreground max-w-[150px] truncate">
                        {guest.email}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(guest.rsvp_status)}
                </TableCell>
                <TableCell className="text-center">
                  {getPaymentStatusBadge(guest.payment_status)}
                </TableCell>
                <TableCell className="text-center">
                  {guest.payment_proof_url ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <a
                        href={guest.payment_proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 transition-colors hover:text-blue-800"
                      >
                        <FileImage className="h-3 w-3" /> LIHAT
                      </a>

                      {guest.payment_status === 'pending' && (
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 border-emerald-500 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                  onClick={() => {
                                    const eventId =
                                      guest.guest_events?.[0]?.event_id
                                    if (eventId)
                                      handleUpdatePaymentStatus(
                                        guest.id,
                                        eventId,
                                        'verified',
                                      )
                                  }}
                                  disabled={loading === guest.id}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Verifikasi Bayar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-destructive text-destructive hover:bg-destructive/5 h-6 w-6 p-0"
                                  onClick={() => {
                                    const eventId =
                                      guest.guest_events?.[0]?.event_id
                                    if (eventId)
                                      handleUpdatePaymentStatus(
                                        guest.id,
                                        eventId,
                                        'rejected',
                                      )
                                  }}
                                  disabled={loading === guest.id}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Tolak Bayar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-300">-</span>
                  )}
                </TableCell>
                <TableCell className="mr-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => {
                              const encodedId = encodeUUID(guest.id)
                              const nameSlug = slugify(guest.full_name, {
                                lower: true,
                                strict: true,
                              })
                              const eventSlug = eventName
                                ? '-' +
                                  slugify(eventName, {
                                    lower: true,
                                    strict: true,
                                  })
                                : ''
                              const url = `${window.location.origin}/invite/${encodedId}-${nameSlug}${eventSlug}`
                              navigator.clipboard.writeText(url)
                              toast.success('Link undangan berhasil disalin!')
                            }}
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Salin Link Undangan</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary h-8 w-8"
                          >
                            <UserPen className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Edit Tamu</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 h-8 w-8"
                            onClick={() => handleDelete(guest.id)}
                            disabled={loading === guest.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Hapus Tamu</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
