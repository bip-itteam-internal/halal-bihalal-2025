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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500 bg-emerald-50 px-1.5 py-0 text-emerald-600"
          >
            <CheckCircle2 className="h-3 w-3" /> Confirmed
          </Badge>
        )
      case 'declined':
        return (
          <Badge
            variant="outline"
            className="border-destructive text-destructive bg-destructive/5 gap-1 px-1.5 py-0"
          >
            <XCircle className="h-3 w-3" /> Declined
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500 bg-amber-50 px-1.5 py-0 text-amber-600"
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
          <Badge variant="secondary" className="font-normal">
            Internal
          </Badge>
        )
      case 'external':
        return (
          <Badge variant="outline" className="font-normal">
            Eksternal
          </Badge>
        )
      case 'tenant':
        return (
          <Badge
            variant="outline"
            className="border-purple-200 bg-purple-50 font-normal text-purple-700"
          >
            Tenant
          </Badge>
        )
      default:
        return type
    }
  }

  return (
    <div className="rounded-md border bg-white">
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
            <TableHead className="pr-6 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
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
                <TableCell>{getStatusBadge(guest.rsvp_status)}</TableCell>
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
