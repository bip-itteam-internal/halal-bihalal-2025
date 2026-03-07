'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react'
import { Guest } from '@/types'
import { MasterGuestTable } from '@/components/modules/guests/master-guest-table'
import { AddGuestSheet } from '@/components/modules/guests/add-guest-sheet'
import { ImportGuestSheet } from '@/components/modules/guests/import-guest-sheet'
import { toast } from 'sonner'

export default function MasterGuestPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch Guests with Pagination and Search
      let query = supabase
        .from('guests')
        .select('*, guest_events(event_id, events(name))', { count: 'exact' })

      if (searchQuery) {
        query = query.ilike('full_name', `%${searchQuery}%`)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const {
        data: guestsData,
        count,
        error,
      } = await query.order('created_at', { ascending: false }).range(from, to)

      if (error) throw error

      setGuests(guestsData || [])
      setTotalCount(count || 0)
    } catch (err: unknown) {
      const error = err as Error
      console.error(error)
      toast.error(error.message || 'Gagal memuat data master tamu.')
    } finally {
      setLoading(false)
    }
  }, [supabase, page, pageSize, searchQuery])

  useEffect(() => {
    fetchGuests()
  }, [page, searchQuery, fetchGuests])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <AppLayout
      header={
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Master Tamu</h2>
            <p className="text-muted-foreground text-[10px] leading-tight">
              Kelola database utama seluruh tamu undangan.
            </p>
          </div>
        </div>
      }
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
              onClick={fetchGuests}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
            {/* We need to update these sheets to handle null eventId */}
            <ImportGuestSheet eventId={''} onSuccess={fetchGuests} />
            <AddGuestSheet eventId={''} onSuccess={fetchGuests} />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-md border bg-white">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">
                Memuat database tamu...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <MasterGuestTable
              guests={guests}
              totalCount={totalCount}
              searchFilter={searchQuery}
              onRefresh={fetchGuests}
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
