'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Guest } from '@/types'
import { MasterGuestTable } from '@/components/modules/guests/master-guest-table'
import { AddGuestSheet } from '@/components/modules/guests/add-guest-sheet'
import { ImportGuestSheet } from '@/components/modules/guests/import-guest-sheet'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { useProfile } from '@/hooks/use-profile'
import { getGuests } from '@/services/api/guests'

export default function MasterGuestPage() {
  const [loading, setLoading] = useState(true)
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const { role } = useProfile()

  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true)
      const { guests: data, totalCount: count } = await getGuests({
        page,
        pageSize,
        searchQuery,
      })
      setGuests(data)
      setTotalCount(count)
    } catch (err: unknown) {
      const error = err as Error
      console.error(error)
      toast.error(error.message || 'Gagal memuat data master tamu.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery])


  useEffect(() => {
    fetchGuests()
  }, [page, searchQuery, fetchGuests])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <AppLayout
      header={
        <PageHeader
          title="Master Tamu"
          subtitle="Kelola database utama seluruh tamu undangan."
        />
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
          {role !== 'staff' && (
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
              <ImportGuestSheet eventId={''} onSuccess={fetchGuests} />
              <AddGuestSheet eventId={''} onSuccess={fetchGuests} />
            </div>
          )}
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
              role={role || undefined}
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
