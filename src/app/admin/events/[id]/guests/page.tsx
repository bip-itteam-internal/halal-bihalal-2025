'use client'

import { useState, useEffect, useCallback, use, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MoveLeft,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Globe,
  MessageCircle,
  Mail,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Guest, PaymentStatus } from '@/types'
import { GuestListTable } from '@/components/modules/guests/guest-list-table'
import { WhatsappBulkDialog } from '@/components/modules/guests/whatsapp-bulk-dialog'
import { EmailBulkDialog } from '@/components/modules/guests/email-bulk-dialog'
import { ImportGuestSheet } from '@/components/modules/guests/import-guest-sheet'
import { AddGuestSheet } from '@/components/modules/guests/add-guest-sheet'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { clearEventGuestsAction } from '@/app/actions/guest-actions'
import { Trash2 } from 'lucide-react'

function ClearGuestsAction({
  eventId,
  onClear,
}: {
  eventId: string
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleClear = async () => {
    try {
      setIsClearing(true)
      const res = await clearEventGuestsAction(eventId)
      if (res.success) {
        toast.success(res.message)
        setOpen(false)
        onClear()
      } else {
        toast.error(res.message)
      }
    } catch {
      toast.error('Gagal mengosongkan data tamu')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kosongkan Daftar Tamu?</DialogTitle>
          <DialogDescription>
            Tindakan ini akan menghapus semua kaitan tamu dari acara ini. Data
            profil tamu tetap ada di sistem, namun tidak lagi terdaftar di acara
            ini. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isClearing}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={isClearing}
          >
            {isClearing ? 'Membersihkan...' : 'Ya, Kosongkan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type GuestTypeTab = 'all' | 'internal' | 'external'

type GuestSummary = {
  total: number
  confirmed: number
  pending: number
  declined: number
  paymentPending: number
  paymentVerified: number
  paymentRejected: number
}

export default function GuestManagementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id
  const router = useRouter()
  const searchParams = useSearchParams()

  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<{ name: string } | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [guestType, setGuestType] = useState<GuestTypeTab>('internal')
  const [status, setStatus] = useState<string>('all')
  const [payStatus, setPayStatus] = useState<string>('all')
  const [page, setPage] = useState(() => {
    const p = searchParams.get('page')
    return p ? parseInt(p) : 1
  })
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [emailBroadcastOpen, setEmailBroadcastOpen] = useState(false)
  const [summary, setSummary] = useState<GuestSummary>({
    total: 0,
    confirmed: 0,
    pending: 0,
    declined: 0,
    paymentPending: 0,
    paymentVerified: 0,
    paymentRejected: 0,
  })

  const showPaymentColumns = guestType !== 'internal'

  const fetchEventAndGuests = useCallback(
    async (resetPage = false) => {
      try {
        if (resetPage) setPage(1)
        setLoading(true)

        // Fetch Event (only once)
        if (!event) {
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('name')
            .eq('id', eventId)
            .single()

          if (eventError) throw eventError
          setEvent(eventData)
        }

        // Fetch Guests via Junction Table with Pagination and Search
        let query = supabase
          .from('guest_events')
          .select(
            'id, registration_number, payment_proof_url, payment_status, guests!inner(*)',
            {
              count: 'exact',
            },
          )
          .eq('event_id', eventId)

        if (searchQuery) {
          query = query.ilike('guests.full_name', `%${searchQuery}%`)
        }

        if (guestType !== 'all') {
          query = query.eq('guests.guest_type', guestType)
        }

        if (status !== 'all') {
          query = query.eq('guests.rsvp_status', status)
        }

        if (payStatus !== 'all') {
          query = query.eq('payment_status', payStatus)
        }

        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data: mappingData, count } = await query
          .order('registration_number', { ascending: true })
          .range(from, to)

        // Extract guest data and merge with payment info from junction table
        const guestsData: Guest[] = (mappingData || []).map((m) => {
          const guestObj = m.guests as unknown as Guest
          return {
            ...guestObj,
            registration_number: m.registration_number,
            payment_proof_url: m.payment_proof_url || undefined,
            payment_status: m.payment_status as PaymentStatus,
          }
        })

        setGuests(guestsData)
        setTotalCount(count || 0)

        let summaryQuery = supabase
          .from('guest_events')
          .select('payment_status, guests!inner(guest_type, rsvp_status)')
          .eq('event_id', eventId)

        if (guestType !== 'all') {
          summaryQuery = summaryQuery.eq('guests.guest_type', guestType)
        }

        const { data: summaryData, error: summaryError } = await summaryQuery

        if (summaryError) throw summaryError

        const nextSummary = (summaryData || []).reduce<GuestSummary>(
          (acc, item) => {
            const guestRow = item.guests as unknown as {
              guest_type: string
              rsvp_status: string
            }

            acc.total += 1

            if (guestRow.rsvp_status === 'confirmed') acc.confirmed += 1
            else if (guestRow.rsvp_status === 'declined') acc.declined += 1
            else acc.pending += 1

            if (item.payment_status === 'verified') acc.paymentVerified += 1
            else if (item.payment_status === 'rejected')
              acc.paymentRejected += 1
            else if (item.payment_status === 'pending') acc.paymentPending += 1

            return acc
          },
          {
            total: 0,
            confirmed: 0,
            pending: 0,
            declined: 0,
            paymentPending: 0,
            paymentVerified: 0,
            paymentRejected: 0,
          },
        )

        setSummary(nextSummary)
      } catch (err: unknown) {
        const error = err as Error
        console.error(error)
        toast.error(error.message || 'Gagal memuat data tamu.')
      } finally {
        setLoading(false)
      }
    },
    [
      eventId,
      supabase,
      page,
      pageSize,
      searchQuery,
      guestType,
      status,
      payStatus,
      event,
    ],
  )

  const handleUpdateGuest = (guestId: string, updates: Partial<Guest>) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, ...updates } : g)),
    )
  }

  useEffect(() => {
    fetchEventAndGuests()
  }, [page, searchQuery, guestType, status, payStatus, fetchEventAndGuests])

  // Only reset page to 1 when filters actually change
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setPage(1)
  }, [searchQuery, guestType, status, payStatus])

  useEffect(() => {
    if (guestType === 'internal' && payStatus !== 'all') {
      setPayStatus('all')
    }
  }, [guestType, payStatus])

  // Sync page state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [page, router, searchParams])

  const totalPages = Math.ceil(totalCount / pageSize)

  const summaryCards = useMemo(() => {
    const cards = [
      { label: 'Total Tamu', value: summary.total },
      { label: 'Berhasil RSVP', value: summary.confirmed },
      { label: 'Pending RSVP', value: summary.pending },
      { label: 'Ditolak RSVP', value: summary.declined },
    ]

    if (showPaymentColumns) {
      cards.push(
        { label: 'Bayar Pending', value: summary.paymentPending },
        { label: 'Bayar OK', value: summary.paymentVerified },
      )
    }

    return cards
  }, [showPaymentColumns, summary])

  const renderPageHeader = (title: string, subtitle?: string) => (
    <div className="flex items-center gap-3 px-4 py-2">
      <Link href="/admin/events">
        <Button variant="outline" size="sm" className="h-7 w-7">
          <MoveLeft className="h-3.5 w-3.5" />
        </Button>
      </Link>
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground text-[10px] leading-tight">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )

  const renderTableSkeleton = () => (
    <div className="overflow-hidden rounded-md border bg-white">
      <div className="border-b bg-slate-50/50 px-6 py-4">
        <div
          className={`grid items-center gap-4 ${
            showPaymentColumns
              ? 'grid-cols-[60px_1.4fr_0.9fr_1.2fr_1fr_1fr_1fr]'
              : 'grid-cols-[60px_1.6fr_1fr_1.4fr_1fr]'
          }`}
        >
          {Array.from({ length: showPaymentColumns ? 7 : 5 }).map(
            (_, index) => (
              <Skeleton key={index} className="h-3 w-20 rounded-full" />
            ),
          )}
        </div>
      </div>

      <div className="divide-y">
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid items-center gap-4 px-6 py-4 ${
              showPaymentColumns
                ? 'grid-cols-[60px_1.4fr_0.9fr_1.2fr_1fr_1fr_1fr]'
                : 'grid-cols-[60px_1.6fr_1fr_1.4fr_1fr]'
            }`}
          >
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-24 rounded-full" />
            {showPaymentColumns && (
              <>
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <AppLayout
      header={renderPageHeader(
        event ? `Kelola Tamu: ${event.name}` : 'Kelola Tamu',
        'Daftarkan tamu dan kelola RSVP.',
      )}
    >
      <div className="flex-1 space-y-4 p-5 pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Cari nama tamu..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {guestType === 'internal' && (
                <Button
                  className="h-9 gap-2 rounded-xl bg-emerald-600 font-bold tracking-wide text-white uppercase shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]"
                  onClick={() => setBroadcastOpen(true)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Broadcast WA
                </Button>
              )}
              {guestType === 'internal' && (
                <Button
                  variant="outline"
                  className="h-9 gap-2 rounded-xl border-indigo-200 bg-indigo-50 font-bold tracking-wide text-indigo-600 uppercase shadow-sm transition-all hover:scale-[1.02] hover:bg-indigo-100 active:scale-[0.98]"
                  onClick={() => setEmailBroadcastOpen(true)}
                >
                  <Mail className="h-4 w-4" />
                  Broadcast Email
                </Button>
              )}
              <ImportGuestSheet
                eventId={eventId}
                onSuccess={fetchEventAndGuests}
              />
              <AddGuestSheet
                eventId={eventId}
                onSuccess={fetchEventAndGuests}
              />
              <ClearGuestsAction
                eventId={eventId}
                onClear={fetchEventAndGuests}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchEventAndGuests()}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-b pb-4">
            <Tabs
              value={guestType}
              onValueChange={(value) => setGuestType(value as GuestTypeTab)}
              className="w-full"
            >
              <TabsList
                variant="line"
                className="h-auto flex-wrap gap-2 bg-transparent p-0"
              >
                <TabsTrigger
                  value="internal"
                  className="flex items-center gap-2 rounded-full border px-4 py-2 text-xs"
                >
                  <Users className="h-3.5 w-3.5" />
                  Internal Bharata Group
                </TabsTrigger>
                <TabsTrigger
                  value="external"
                  className="flex items-center gap-2 rounded-full border px-4 py-2 text-xs"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Eksternal/Umum
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-[9px] font-bold tracking-[0.28em] text-slate-400 uppercase">
                  {card.label}
                </p>
                <p className="mt-1 text-3xl leading-none font-black tracking-tight text-slate-900">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-b pb-4">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Status RSVP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Tertunda</SelectItem>
                <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                <SelectItem value="declined">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>

            {showPaymentColumns && (
              <Select value={payStatus} onValueChange={setPayStatus}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="Status Bayar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bayar</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Terverifikasi</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(status !== 'all' || payStatus !== 'all' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-8 text-xs"
                onClick={() => {
                  setStatus('all')
                  setPayStatus('all')
                  setSearchQuery('')
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {renderTableSkeleton()}
            <div className="flex items-center justify-between border-t pt-4">
              <Skeleton className="h-4 w-56" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-28" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <GuestListTable
              guests={guests}
              onRefresh={fetchEventAndGuests}
              onUpdateGuest={handleUpdateGuest}
              eventId={eventId}
              showPaymentColumns={showPaymentColumns}
            />

            <WhatsappBulkDialog
              isOpen={broadcastOpen}
              onOpenChange={setBroadcastOpen}
              selectedIds={[]}
              isAllMode={true}
              totalCount={totalCount}
              searchFilter={searchQuery}
              eventId={eventId}
              onSuccess={() => {
                fetchEventAndGuests()
              }}
            />

            <EmailBulkDialog
              isOpen={emailBroadcastOpen}
              onOpenChange={setEmailBroadcastOpen}
              selectedIds={[]}
              isAllMode={true}
              totalCount={totalCount}
              searchFilter={searchQuery}
              eventId={eventId}
              onSuccess={() => {
                fetchEventAndGuests()
              }}
            />

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-xs">
                  Menampilkan{' '}
                  <span className="font-medium">
                    {(page - 1) * pageSize + 1}
                  </span>{' '}
                  sampai{' '}
                  <span className="font-medium">
                    {Math.min(page * pageSize, totalCount)}
                  </span>{' '}
                  dari <span className="font-medium">{totalCount}</span> tamu
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="h-8 px-2"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Sebelumnya
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Simple pagination logic to show current page and surrounding pages
                      let pageNum = page
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else {
                        if (page <= 3) pageNum = i + 1
                        else if (page >= totalPages - 2)
                          pageNum = totalPages - 4 + i
                        else pageNum = page - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          type="button"
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="h-8 w-8 p-0 text-xs"
                          disabled={loading}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="h-8 px-2"
                  >
                    Berikutnya
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
