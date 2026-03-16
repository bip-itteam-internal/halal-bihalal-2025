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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Clock,
  XCircle,
  Link as LinkIcon,
  FileImage,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'
import { buildInvitePath } from '@/lib/event-identifiers'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Guest } from '@/types'

interface GuestListTableProps {
  guests: Guest[]
  eventName?: string
  onRefresh: () => void
  onUpdateGuest?: (guestId: string, updates: Partial<Guest>) => void
  startNumber?: number
  eventId?: string
}

export function GuestListTable({
  guests,
  eventName,
  onRefresh,
  onUpdateGuest,
  startNumber = 1,
  eventId: propEventId,
}: GuestListTableProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedGuestForProof, setSelectedGuestForProof] =
    useState<Guest | null>(null)

  const handleUpdatePaymentStatus = async (
    guestId: string,
    eventId: string,
    status: 'verified' | 'rejected',
  ) => {
    console.log('handleUpdatePaymentStatus called with:', {
      guestId,
      eventId,
      status,
    })
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
      if (onUpdateGuest) {
        onUpdateGuest(guestId, {
          payment_status: status,
          rsvp_status: status === 'verified' ? 'confirmed' : undefined,
        } as Partial<Guest>)
      } else {
        onRefresh()
      }
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Gagal merubah status pembayaran.')
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
                      <button
                        onClick={() => setSelectedGuestForProof(guest)}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 transition-colors hover:text-blue-800"
                      >
                        <FileImage className="h-3 w-3" /> LIHAT
                      </button>
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
                              const eventSlug = eventName
                                ? eventName
                                    .toLowerCase()
                                    .trim()
                                    .replace(/[^a-z0-9\s-]/g, '')
                                    .replace(/\s+/g, '-')
                                    .replace(/-+/g, '-')
                                : undefined
                              if (!guest.invitation_code) {
                                toast.error('Tamu ini belum memiliki invitation code.')
                                return
                              }
                              const url = `${window.location.origin}${buildInvitePath(
                                guest.invitation_code,
                                eventSlug,
                              )}`
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
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedGuestForProof}
        onOpenChange={(open) => !open && setSelectedGuestForProof(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-widest text-slate-400 uppercase">
              Verifikasi Pembayaran
            </DialogTitle>
            <p className="text-xs font-bold text-slate-900">
              {selectedGuestForProof?.full_name}
            </p>
          </DialogHeader>
          <div className="mt-2 flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border bg-slate-50 shadow-inner">
            {selectedGuestForProof?.payment_proof_url && (
              <Image
                src={selectedGuestForProof.payment_proof_url}
                alt="Bukti Bayar"
                width={400}
                height={533}
                unoptimized
                className="h-full w-full object-contain"
              />
            )}
          </div>

          {selectedGuestForProof?.payment_status === 'pending' && (
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/5 h-11 flex-1 rounded-xl text-[10px] font-bold tracking-widest uppercase"
                onClick={() => {
                  const eid =
                    propEventId ||
                    selectedGuestForProof.guest_events?.[0]?.event_id
                  if (eid) {
                    handleUpdatePaymentStatus(
                      selectedGuestForProof.id,
                      eid,
                      'rejected',
                    )
                    setSelectedGuestForProof(null)
                  }
                }}
                disabled={loading === selectedGuestForProof.id}
              >
                Tolak Pembayaran
              </Button>
              <Button
                className="h-11 flex-1 rounded-xl bg-emerald-600 text-[10px] font-bold tracking-widest text-white uppercase shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                onClick={() => {
                  const eid =
                    propEventId ||
                    selectedGuestForProof.guest_events?.[0]?.event_id
                  if (eid) {
                    handleUpdatePaymentStatus(
                      selectedGuestForProof.id,
                      eid,
                      'verified',
                    )
                    setSelectedGuestForProof(null)
                  } else {
                    console.error('No eventId found!')
                    toast.error('Gagal verifikasi: ID Event tidak ditemukan')
                  }
                }}
                disabled={loading === selectedGuestForProof.id}
              >
                Verifikasi Berhasil
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
