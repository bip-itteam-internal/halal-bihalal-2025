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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Clock,
  XCircle,
  FileImage,
  Send,
  Loader2,
  MessageCircle,
  Trash2,
} from 'lucide-react'
import {
  bulkSendWhatsappAction,
  sendTenantVerificationAction,
} from '@/app/actions/whatsapp-actions'
import { deleteGuestAction } from '@/app/actions/guest-actions'
import { Badge } from '@/components/ui/badge'
import { WhatsappBulkDialog } from '@/components/modules/guests/whatsapp-bulk-dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'
import { FaWhatsapp } from 'react-icons/fa'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Guest } from '@/types'

interface GuestListTableProps {
  guests: Guest[]
  onRefresh: () => void
  onUpdateGuest?: (guestId: string, updates: Partial<Guest>) => void
  startNumber?: number
  eventId?: string
  showPaymentColumns?: boolean
}

export function GuestListTable({
  guests,
  onRefresh,
  onUpdateGuest,
  startNumber = 1,
  eventId: propEventId,
  showPaymentColumns = true,
}: GuestListTableProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedGuestForProof, setSelectedGuestForProof] =
    useState<Guest | null>(null)
  const [waDialogOpen, setWaDialogOpen] = useState(false)
  const [selectedGuestForWa, setSelectedGuestForWa] = useState<Guest | null>(
    null,
  )
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const getWhatsappLink = (phone?: string | null) => {
    if (!phone) return null

    const digits = phone.replace(/[^\d]/g, '')
    if (!digits) return null

    const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
    return `https://wa.me/${normalized}`
  }

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

        // If it's a tenant, send notification with login link
        const guest = guests.find((g) => g.id === guestId)
        if (guest?.guest_type === 'tenant') {
          try {
            const res = await sendTenantVerificationAction(guestId)
            if (res.success) {
              toast.success('Undangan Login Tenant terkirim via WhatsApp!')
            } else {
              toast.error('Pembayaran OK, tapi gagal kirim WA: ' + res.message)
            }
          } catch (e) {
            console.error('Failed to send tenant verification WA:', e)
          }
        }
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
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b-slate-100 bg-slate-50/50 text-nowrap">
              <TableHead className="w-[50px] px-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                #
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
              {showPaymentColumns && (
                <TableHead className="text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Bayar
                </TableHead>
              )}
              {showPaymentColumns && (
                <TableHead className="text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Bukti Bayar
                </TableHead>
              )}
              <TableHead className="w-[100px] text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showPaymentColumns ? 8 : 6}
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
                  className="group border-b-slate-50 transition-colors hover:bg-slate-50/50"
                >
                  <TableCell className="text-[11px] font-bold text-slate-500 tabular-nums">
                    {startNumber + index}
                  </TableCell>
                  <TableCell className="py-3 font-medium">
                    {guest.full_name}
                  </TableCell>
                  <TableCell>{getGuestTypeLabel(guest.guest_type)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-0.5 text-[11px] leading-tight">
                      {guest.phone && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">
                            {guest.phone}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {/* Original Direct Link */}
                            <a
                              href={getWhatsappLink(guest.phone) || undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                              title={`Buka Chat WhatsApp`}
                            >
                              <FaWhatsapp className="h-3.5 w-3.5" />
                            </a>

                            {/* Woo-Wa Auto Send */}
                            {guest.guest_type === 'internal' && (
                              <button
                                onClick={() => setSelectedGuestForWa(guest)}
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700 ${loading === guest.id ? 'animate-pulse' : ''}`}
                                title={`Kirim Undangan Otomatis (Woo-Wa)`}
                                disabled={loading === guest.id}
                              >
                                {loading === guest.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                              </button>
                            )}

                            {guest.wa_sent_at && (
                              <Badge
                                variant="ghost"
                                className="h-3 px-1 text-[8px] font-bold text-emerald-500 uppercase"
                              >
                                DONE
                              </Badge>
                            )}
                          </div>
                        </div>
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
                  {showPaymentColumns && (
                    <TableCell className="text-center">
                      {getPaymentStatusBadge(guest.payment_status)}
                    </TableCell>
                  )}
                  {showPaymentColumns && (
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
                  )}
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      onClick={() => setGuestToDelete(guest)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedGuestForProof}
        onOpenChange={(open) => !open && setSelectedGuestForProof(null)}
      >
        <DialogContent className="max-h-[95vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-widest text-slate-400 uppercase">
              Verifikasi Pembayaran
            </DialogTitle>
            <p className="text-xs font-bold text-slate-900">
              {selectedGuestForProof?.full_name}
            </p>
          </DialogHeader>
          <Alert className="border-l-4 border-amber-200 bg-amber-50 text-amber-900">
            <AlertTitle className="text-[10px] font-bold uppercase">
              Konfirmasi Dana
            </AlertTitle>
            <AlertDescription className="text-[10px] leading-relaxed">
              Pastikan dana sudah masuk ke rekening sebelum verifikasi.
            </AlertDescription>
          </Alert>
          <div className="group relative mt-2 flex max-h-[400px] w-full items-center justify-center overflow-hidden rounded-2xl border bg-slate-50 shadow-inner">
            {selectedGuestForProof?.payment_proof_url && (
              <Image
                src={selectedGuestForProof.payment_proof_url}
                alt="Bukti Bayar"
                width={400}
                height={533}
                unoptimized
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute right-2 bottom-2 rounded-full bg-black/50 px-2 py-1 text-[8px] text-white backdrop-blur-sm">
              Click to view full
            </div>
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
      <Dialog
        open={!!selectedGuestForWa}
        onOpenChange={(open) => !open && setSelectedGuestForWa(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <MessageCircle className="h-4 w-4" />
              </div>
              Kirim Undangan WA
            </DialogTitle>
            <DialogDescription className="pt-2">
              Apakah Anda yakin ingin mengirim undangan otomatis via WhatsApp ke{' '}
              <span className="font-bold text-slate-900">
                {selectedGuestForWa?.full_name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-[11px] leading-relaxed text-emerald-800">
            <p className="mb-1 font-semibold tracking-wider uppercase">
              Preview Pesan:
            </p>
            <p className="italic">
              "Yth. *{selectedGuestForWa?.full_name}*... 🌙 UNDANGAN SILATURAHMI
              & HALAL BIHALAL 2025..."
            </p>
          </div>
          <DialogFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setSelectedGuestForWa(null)}
            >
              Batal
            </Button>
            <Button
              onClick={async () => {
                if (!selectedGuestForWa) return
                const guestId = selectedGuestForWa.id
                const guestName = selectedGuestForWa.full_name
                setSelectedGuestForWa(null)

                try {
                  setLoading(guestId)
                  const eventName =
                    guests.find((g) => g.id === guestId)?.guest_events?.[0]
                      ?.events?.name || 'Silaturahmi & Halal Bihalal 2026'
                  const res = await bulkSendWhatsappAction(
                    [guestId],
                    eventName,
                    propEventId || '',
                  )

                  if (res.success) {
                    toast.success(`Berhasil dikirim ke ${guestName}`)
                    if (onUpdateGuest) {
                      onUpdateGuest(guestId, {
                        wa_sent_at: new Date().toISOString(),
                      })
                    } else {
                      onRefresh()
                    }
                  } else {
                    toast.error(res.message)
                  }
                } catch (error) {
                  toast.error('Gagal mengirim pesan')
                  console.error(error)
                } finally {
                  setLoading(null)
                }
              }}
            >
              Kirim Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!guestToDelete}
        onOpenChange={(open) => !open && setGuestToDelete(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-4 w-4" />
              </div>
              Hapus Tamu
            </DialogTitle>
            <DialogDescription className="pt-2">
              Apakah Anda yakin ingin menghapus{' '}
              <span className="font-bold text-slate-900">
                {guestToDelete?.full_name}
              </span>{' '}
              dari daftar tamu? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setGuestToDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              onClick={async () => {
                if (!guestToDelete) return
                try {
                  setIsDeleting(true)
                  const res = await deleteGuestAction(
                    guestToDelete.id,
                    propEventId,
                  )
                  if (res.success) {
                    toast.success(res.message)
                    setGuestToDelete(null)
                    onRefresh()
                  } else {
                    toast.error(res.message)
                  }
                } catch (error) {
                  toast.error('Gagal menghapus tamu')
                  console.error(error)
                } finally {
                  setIsDeleting(false)
                }
              }}
              className="bg-red-600 text-white transition-all hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Hapus Sekarang'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WhatsappBulkDialog
        isOpen={waDialogOpen}
        onOpenChange={setWaDialogOpen}
        selectedIds={[]}
        eventId={propEventId}
        onSuccess={() => {
          onRefresh()
        }}
      />
    </div>
  )
}
