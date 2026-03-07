'use client'

import { useState, useEffect, useCallback, use } from 'react'
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
} from 'lucide-react'
import Link from 'next/link'
import { Guest } from '@/types'
import { GuestListTable } from '@/components/modules/guests/guest-list-table'
import { AddGuestSheet } from '@/components/modules/guests/add-guest-sheet'
import { ImportGuestSheet } from '@/components/modules/guests/import-guest-sheet'
import { toast } from 'sonner'

export default function GuestManagementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id

  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<{ name: string } | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const fetchEventAndGuests = useCallback(async () => {
    try {
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

      // Fetch Guests with Pagination and Search
      let query = supabase
        .from('guests')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId)

      if (searchQuery) {
        query = query.ilike('full_name', `%${searchQuery}%`)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data: guestsData, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      setGuests(guestsData || [])
      setTotalCount(count || 0)
    } catch (err: unknown) {
      const error = err as Error
      console.error(error)
      toast.error(error.message || 'Gagal memuat data tamu.')
    } finally {
      setLoading(false)
    }
  }, [eventId, supabase, page, pageSize, searchQuery, event])

  useEffect(() => {
    fetchEventAndGuests()
  }, [page, searchQuery, fetchEventAndGuests])

  const totalPages = Math.ceil(totalCount / pageSize)

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

  return (
    <AppLayout
      header={renderPageHeader(
        event ? `Kelola Tamu: ${event.name}` : 'Kelola Tamu',
        'Daftarkan tamu dan kelola RSVP.',
      )}
    >
      <div className="flex-1 space-y-4 p-5 pt-4">
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
            <Button
              variant="outline"
              size="icon"
              onClick={fetchEventAndGuests}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
            <ImportGuestSheet
              eventId={eventId}
              onSuccess={fetchEventAndGuests}
            />
            <AddGuestSheet eventId={eventId} onSuccess={fetchEventAndGuests} />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-md border bg-white">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">
                Memuat daftar tamu...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <GuestListTable
              guests={guests}
              eventName={event?.name}
              onRefresh={fetchEventAndGuests}
              startNumber={(page - 1) * pageSize + 1}
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
