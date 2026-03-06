'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Search,
  CheckCircle2,
  Ticket,
  Activity,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Guest, Checkin } from '@/types'
import { StatsCard } from '@/components/shared/stats-card'
import { AppLayout } from '@/components/layout/app-layout'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface GuestWithCheckins extends Guest {
  checkins: Checkin[]
}

export default function DashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    total: 0,
    internal: 0,
    external: 0,
    checkedIn: 0,
    quotaLeft: 0,
  })

  const [guests, setGuests] = useState<GuestWithCheckins[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [regStatus, setRegStatus] = useState<'open' | 'closed'>('open')

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      const { data: event } = await supabase.from('events').select('*').single()
      if (event) {
        setRegStatus(event.public_reg_status)
      }

      const { data: allGuests, error } = await supabase
        .from('guests')
        .select(`*, checkins(*)`)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!allGuests) return

      setGuests(allGuests as GuestWithCheckins[])

      const total = allGuests.length
      const internal = allGuests.filter(
        (g) => g.guest_type === 'internal',
      ).length
      const external = allGuests.filter(
        (g) => g.guest_type === 'external',
      ).length
      const checkedIn = allGuests.filter(
        (g) => g.checkins && g.checkins.length > 0,
      ).length

      setStats({
        total,
        internal,
        external,
        checkedIn,
        quotaLeft: event ? event.external_quota - external : 0,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const toggleRegStatus = async () => {
    const newStatus = regStatus === 'open' ? 'closed' : 'open'
    const { error } = await supabase
      .from('events')
      .update({ public_reg_status: newStatus })
      .eq('name', 'Halal Bihalal 2025')

    if (!error) setRegStatus(newStatus)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const filteredGuests = guests.filter(
    (g) =>
      g.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.address &&
        g.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (g.email && g.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalPages = Math.ceil(filteredGuests.length / pageSize)
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={regStatus === 'open' ? 'destructive' : 'default'}
              onClick={toggleRegStatus}
            >
              {regStatus === 'open'
                ? 'Close Registration'
                : 'Open Registration'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<Users />}
            label="Total Registrants"
            value={stats.total}
          />
          <StatsCard
            icon={<CheckCircle2 />}
            label="Checked In"
            value={stats.checkedIn}
          />
          <StatsCard
            icon={<Ticket />}
            label="Remaining Quota"
            value={stats.quotaLeft}
          />
          <StatsCard
            icon={<Activity />}
            label="Internal / External"
            value={`${stats.internal} / ${stats.external}`}
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Guest List</CardTitle>
                <CardDescription>
                  Manage and monitor all registered event guests.
                </CardDescription>
              </div>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Search className="text-muted-foreground mr-2 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Organization/Address</TableHead>
                  <TableHead>Check-in Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="text-muted-foreground mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : paginatedGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No guests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="font-medium">{guest.full_name}</div>
                        <div className="text-muted-foreground text-sm">
                          {guest.phone || 'No phone'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            guest.guest_type === 'internal'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {guest.guest_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {guest.guest_type === 'tenant'
                          ? guest.metadata.umkm_product
                          : guest.address || 'Personal'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {(['siang', 'malam'] as const).map((s) => {
                            const hasChecked = guest.checkins?.some(
                              (c: Checkin) => c.session_type === s,
                            )
                            return (
                              <Badge
                                key={s}
                                variant={hasChecked ? 'default' : 'outline'}
                              >
                                {s}
                              </Badge>
                            )
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {!loading && filteredGuests.length > 0 && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div className="text-muted-foreground text-sm">
                  Menampilkan{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{' '}
                  sampai{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, filteredGuests.length)}
                  </span>{' '}
                  dari{' '}
                  <span className="font-medium">{filteredGuests.length}</span>{' '}
                  tamu
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Sebelumnya
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          (p >= currentPage - 1 && p <= currentPage + 1),
                      )
                      .map((p, i, arr) => {
                        const showEllipsis = i > 0 && p !== arr[i - 1] + 1
                        return (
                          <div key={p} className="flex items-center gap-1">
                            {showEllipsis && (
                              <span className="text-muted-foreground px-1">
                                ...
                              </span>
                            )}
                            <Button
                              variant={
                                currentPage === p ? 'default' : 'outline'
                              }
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setCurrentPage(p)}
                            >
                              {p}
                            </Button>
                          </div>
                        )
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
