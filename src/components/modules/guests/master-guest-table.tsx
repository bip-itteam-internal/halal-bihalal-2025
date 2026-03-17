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
  CalendarPlus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Guest } from '@/types'
import { AssignEventDialog } from '@/components/modules/guests/assign-event-dialog'

interface MasterGuestTableProps {
  guests: Guest[]
  totalCount: number
  searchFilter?: string
  onRefresh: () => void
  startNumber?: number
  role?: string
}

export function MasterGuestTable({
  guests,
  totalCount,
  searchFilter = '',
  onRefresh,
  startNumber = 1,
  role,
}: MasterGuestTableProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)

  const [guestsToAssign, setGuestsToAssign] = useState<
    { id: string; name: string }[]
  >([])
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tamu ini dari Master?'))
      return

    try {
      setLoading(id)
      const { error } = await supabase.from('guests').delete().eq('id', id)
      if (error) throw error
      toast.success('Tamu berhasil dihapus dari Master.')
      onRefresh()
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Gagal menghapus tamu.')
    } finally {
      setLoading(null)
    }
  }

  const toggleSelectAll = () => {
    if (isAllSelected || selectedIds.length === guests.length) {
      setSelectedIds([])
      setIsAllSelected(false)
    } else {
      setSelectedIds(guests.map((g) => g.id))
    }
  }

  const toggleSelect = (id: string) => {
    setIsAllSelected(false)
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleBulkAssign = () => {
    const selectedGuests = guests.filter((g) => selectedIds.includes(g.id))
    setGuestsToAssign(
      selectedGuests.map((g) => ({ id: g.id, name: g.full_name })),
    )
    setAssignDialogOpen(true)
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
    <div className="space-y-4">
      {role !== 'staff' && selectedIds.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                {isAllSelected ? totalCount : selectedIds.length}
              </span>
              {isAllSelected ? 'Seluruh' : ''} Tamu terpilih
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleBulkAssign}
                className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <CalendarPlus className="h-4 w-4" />
                Hubungkan ke Event (
                {isAllSelected ? totalCount : selectedIds.length})
              </Button>
            </div>
          </div>

          {!isAllSelected &&
            selectedIds.length === guests.length &&
            totalCount > guests.length && (
              <div className="border-t border-emerald-100 pt-2 text-center">
                <button
                  onClick={() => setIsAllSelected(true)}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Pilih seluruh {totalCount} tamu di database
                </button>
              </div>
            )}

          {isAllSelected && (
            <div className="border-t border-emerald-100 pt-2 text-center">
              <button
                onClick={() => {
                  setIsAllSelected(false)
                  setSelectedIds([])
                }}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Batalkan pilihan seluruh tamu
              </button>
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 text-nowrap">
              {role !== 'staff' && (
                <TableHead className="w-[40px] px-4">
                  <Checkbox
                    checked={
                      isAllSelected ||
                      (guests.length > 0 &&
                        selectedIds.length === guests.length)
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead className="w-[60px] text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
                No
              </TableHead>
              <TableHead className="w-[200px] text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Nama Tamu
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Tipe
              </TableHead>
              <TableHead className="w-[150px] text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Acara
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Kontak
              </TableHead>
              <TableHead className="text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Status RSVP
              </TableHead>
              {role !== 'staff' && (
                <TableHead className="pr-6 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Aksi
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={role === 'staff' ? 6 : 8}
                  className="text-muted-foreground h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-lg font-medium">
                      Belum ada tamu di Master
                    </span>
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
                  className={`transition-colors hover:bg-slate-50/50 ${
                    isAllSelected || selectedIds.includes(guest.id)
                      ? 'bg-emerald-50/30'
                      : ''
                  }`}
                >
                  {role !== 'staff' && (
                    <TableCell className="px-4">
                      <Checkbox
                        checked={
                          isAllSelected || selectedIds.includes(guest.id)
                        }
                        onCheckedChange={() => toggleSelect(guest.id)}
                        aria-label={`Select ${guest.full_name}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-center text-sm font-semibold text-slate-600">
                    {startNumber + index}
                  </TableCell>
                  <TableCell className="py-3 font-medium text-slate-900">
                    {guest.full_name}
                  </TableCell>
                  <TableCell>{getGuestTypeLabel(guest.guest_type)}</TableCell>
                  <TableCell>
                    {guest.guest_events && guest.guest_events.length > 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex cursor-help items-center gap-1">
                              <Badge
                                variant="secondary"
                                className="block h-5 max-w-[120px] truncate border-emerald-100 bg-emerald-50 py-0 text-[10px] font-medium text-emerald-700"
                              >
                                {guest.guest_events[0].events?.name}
                              </Badge>
                              {guest.guest_events.length > 1 && (
                                <span className="rounded-sm bg-emerald-100 px-1 text-[9px] font-bold text-emerald-600">
                                  +{guest.guest_events.length - 1}
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[300px] rounded-xl border-slate-200 bg-white p-3 shadow-xl duration-200"
                          >
                            <div className="space-y-2">
                              <p className="mb-1 border-b border-slate-100 pb-1.5 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                                Daftar Acara
                              </p>
                              <div className="space-y-1.5">
                                {guest.guest_events.map((ge, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"
                                  >
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    {ge.events?.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="px-2 text-xs text-slate-300">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-0.5 text-[11px] leading-tight">
                      {guest.phone && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-700">
                            {guest.phone}
                          </span>
                        </div>
                      )}
                      {guest.email && (
                        <span className="text-muted-foreground max-w-[150px] truncate">
                          {guest.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(guest.rsvp_status)}</TableCell>
                  {role !== 'staff' && (
                    <TableCell className="mr-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => {
                                  setGuestsToAssign([
                                    { id: guest.id, name: guest.full_name },
                                  ])
                                  setAssignDialogOpen(true)
                                }}
                              >
                                <CalendarPlus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Hubungkan ke Event</p>
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
                              <p className="text-xs">Edit Profil</p>
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
                              <p className="text-xs">Hapus dari Master</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AssignEventDialog
        guestIds={isAllSelected ? [] : guestsToAssign.map((g) => g.id)}
        isAllMode={isAllSelected}
        totalCount={totalCount}
        searchFilter={searchFilter}
        guestNames={isAllSelected ? [] : guestsToAssign.map((g) => g.name)}
        isOpen={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onSuccess={() => {
          setSelectedIds([])
          setIsAllSelected(false)
          onRefresh()
        }}
      />
    </div>
  )
}
