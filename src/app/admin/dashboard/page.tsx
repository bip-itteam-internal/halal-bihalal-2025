'use client'

import { useEffect, useState, useCallback } from 'react'
import { CalendarDays, Users, CheckCircle2, Globe } from 'lucide-react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { StatsCard } from '@/components/shared/stats-card'
import { PageHeader } from '@/components/shared/page-header'
import { useProfile } from '@/hooks/use-profile'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatJakartaDate } from '@/lib/utils'

type DashboardEvent = {
  id: string
  name: string
  event_date: string
  event_type: 'internal' | 'public' | null
  public_reg_status: 'open' | 'closed'
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalGuests: 0,
    checkedIn: 0,
    openPublicEvents: 0,
  })
  const [recentEvents, setRecentEvents] = useState<DashboardEvent[]>([])
  const { role } = useProfile()

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)

      const [eventsRes, eventsCountRes, guestsRes, checkinsRes] =
        await Promise.all([
          supabase
            .from('events')
            .select('id,name,event_date,event_type,public_reg_status')
            .order('created_at', { ascending: false })
            .limit(8),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('guests').select('id', { count: 'exact', head: true }),
          supabase
            .from('checkins')
            .select('id', { count: 'exact', head: true }),
        ])

      if (eventsRes.error) throw eventsRes.error
      if (eventsCountRes.error) throw eventsCountRes.error
      if (guestsRes.error) throw guestsRes.error
      if (checkinsRes.error) throw checkinsRes.error

      const events = (eventsRes.data || []) as DashboardEvent[]

      setRecentEvents(events)
      setStats({
        totalEvents: eventsCountRes.count || 0,
        totalGuests: guestsRes.count || 0,
        checkedIn: checkinsRes.count || 0,
        openPublicEvents: events.filter(
          (event) =>
            event.event_type === 'public' && event.public_reg_status === 'open',
        ).length,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return (
    <AppLayout
      header={
        <PageHeader
          title="Dashboard"
          subtitle="Ringkasan aktivitas event dan tamu."
          actions={
            <Link href="/admin/events">
              <Button size="sm" variant="outline" className="h-8">
                Lihat Manajemen Event
              </Button>
            </Link>
          }
        />
      }
    >
      <div className="flex-1 space-y-6 p-5 pt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<CalendarDays className="h-4 w-4" />}
            label="Total Event"
            value={loading ? '...' : stats.totalEvents}
          />
          <StatsCard
            icon={<Users className="h-4 w-4" />}
            label="Total Tamu"
            value={loading ? '...' : stats.totalGuests}
          />
          <StatsCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Total Check-in"
            value={loading ? '...' : stats.checkedIn}
          />
          <StatsCard
            icon={<Globe className="h-4 w-4" />}
            label="Publik Dibuka"
            value={loading ? '...' : stats.openPublicEvents}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Terbaru</CardTitle>
            <CardDescription>
              Daftar event terbaru yang terdaftar di sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Event</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status Registrasi</TableHead>
                  {role !== 'staff' && (
                    <TableHead className="text-right">Aksi</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground h-24 text-center"
                    >
                      {loading ? 'Memuat data...' : 'Belum ada event.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {event.name}
                      </TableCell>
                      <TableCell>
                        {event.event_date
                          ? formatJakartaDate(event.event_date, 'PPP p')
                          : '-'}
                      </TableCell>
                      <TableCell className="capitalize">
                        {event.event_type || '-'}
                      </TableCell>
                      <TableCell>
                        {event.public_reg_status === 'open' ? 'Buka' : 'Tutup'}
                      </TableCell>
                      {role !== 'staff' && (
                        <TableCell className="text-right">
                          <Link href={`/admin/events/${event.id}`}>
                            <Button variant="outline" size="sm">
                              Detail
                            </Button>
                          </Link>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
