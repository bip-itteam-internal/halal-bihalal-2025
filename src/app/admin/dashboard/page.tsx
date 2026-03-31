'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  CalendarDays,
  Users,
  CheckCircle2,
  Globe,
  QrCode,
  Gift,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatJakartaDate } from '@/lib/utils'
import {
  DashboardBreakdown,
  DashboardCheckinStats,
  DashboardEvent,
  DashboardPaymentStats,
  DashboardRecentCheckin,
  DashboardRSVPStats,
  DashboardStats,
  getDashboardData,
} from '@/services/api/dashboard'

type QuickAction = {
  href: string
  label: string
  description: string
  icon: React.ReactNode
}

function MetricPanel({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: Array<{ label: string; value: number; tone?: 'default' | 'good' | 'warn' }>
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl border bg-slate-50/70 px-3 py-2"
          >
            <span className="text-sm font-medium text-slate-600">{item.label}</span>
            <span
              className={`text-lg font-black ${
                item.tone === 'good'
                  ? 'text-emerald-600'
                  : item.tone === 'warn'
                    ? 'text-amber-600'
                    : 'text-slate-900'
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalGuests: 0,
    checkedIn: 0,
    openPublicEvents: 0,
  })
  const [recentEvents, setRecentEvents] = useState<DashboardEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardEvent[]>([])
  const [guestTypeStats, setGuestTypeStats] = useState<DashboardBreakdown>({
    internal: 0,
    external: 0,
  })
  const [rsvpStats, setRsvpStats] = useState<DashboardRSVPStats>({
    confirmed: 0,
    pending: 0,
    declined: 0,
  })
  const [paymentStats, setPaymentStats] = useState<DashboardPaymentStats>({
    verified: 0,
    pending: 0,
    rejected: 0,
  })
  const [checkinStats, setCheckinStats] = useState<DashboardCheckinStats>({
    exchange: 0,
    entrance: 0,
  })
  const [recentCheckins, setRecentCheckins] = useState<DashboardRecentCheckin[]>([])
  const { role } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!loading && role === 'staff') {
      router.replace('/admin/events')
    }
  }, [role, loading, router])

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getDashboardData()
      setRecentEvents(data.recentEvents)
      setUpcomingEvents(data.upcomingEvents)
      setStats(data.stats)
      setGuestTypeStats(data.guestTypeStats)
      setRsvpStats(data.rsvpStats)
      setPaymentStats(data.paymentStats)
      setCheckinStats(data.checkinStats)
      setRecentCheckins(data.recentCheckins)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const quickActions: QuickAction[] = [
    {
      href: '/admin/events',
      label: 'Kelola Event',
      description: 'Atur event, guest rules, dan landing page.',
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      href: '/admin/guests',
      label: 'Master Guests',
      description: 'Lihat dan rapikan seluruh tamu lintas event.',
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: '/admin/scanner',
      label: 'Buka Scanner',
      description: 'Langsung ke alur check-in QR.',
      icon: <QrCode className="h-4 w-4" />,
    },
    {
      href: '/admin/doorprize',
      label: 'Doorprize',
      description: 'Masuk ke modul doorprize untuk event berjalan.',
      icon: <Gift className="h-4 w-4" />,
    },
  ]

  return (
    <AppLayout
      header={
        <PageHeader
          title="Dashboard Operasional"
          subtitle="Pantau event aktif, status tamu, pembayaran, dan check-in."
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            icon={<CalendarDays className="h-4 w-4" />}
            label="Total Event"
            value={loading ? '...' : stats.totalEvents}
            className="border-slate-200"
          />
          <StatsCard
            icon={<Users className="h-4 w-4" />}
            label="Total Tamu"
            value={loading ? '...' : stats.totalGuests}
            className="border-slate-200"
          />
          <StatsCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Total Check-in"
            value={loading ? '...' : stats.checkedIn}
            className="border-slate-200"
          />
          <StatsCard
            icon={<Globe className="h-4 w-4" />}
            label="Event Publik Aktif"
            value={loading ? '...' : stats.openPublicEvents}
            className="border-slate-200"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Event Terdekat</CardTitle>
              <CardDescription>
                Fokus utama untuk panitia berdasarkan tanggal event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-2xl border px-4 py-4"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                ))
              ) : upcomingEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-slate-500">
                  Belum ada event mendatang.
                </div>
              ) : (
                upcomingEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-2xl border bg-slate-50/60 px-4 py-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                          {index === 0 ? 'Prioritas' : 'Agenda'}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {event.event_type || '-'}
                        </Badge>
                      </div>
                      <p className="text-base font-bold text-slate-900">
                        {event.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatJakartaDate(event.event_date, 'PPP')}
                      </p>
                    </div>
                    <Link href={`/admin/events/${event.id}`}>
                      <Button size="sm" variant="outline">
                        Detail
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Quick Action</CardTitle>
              <CardDescription>
                Shortcut untuk alur yang paling sering dipakai tim operasional.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="group rounded-2xl border bg-white px-4 py-3 transition-colors hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-700">
                          {action.icon}
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900">{action.label}</p>
                          <p className="text-sm text-slate-500">{action.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <MetricPanel
            title="Komposisi Tamu"
            description="Sebaran tamu lintas kategori."
            items={[
              { label: 'Internal', value: guestTypeStats.internal },
              { label: 'Eksternal', value: guestTypeStats.external },
            ]}
          />
          <MetricPanel
            title="RSVP"
            description="Status konfirmasi kehadiran tamu."
            items={[
              { label: 'Confirmed', value: rsvpStats.confirmed, tone: 'good' },
              { label: 'Pending', value: rsvpStats.pending, tone: 'warn' },
              { label: 'Declined', value: rsvpStats.declined },
            ]}
          />
          <MetricPanel
            title="Pembayaran"
            description="Monitoring verifikasi pembayaran."
            items={[
              { label: 'Verified', value: paymentStats.verified, tone: 'good' },
              { label: 'Pending', value: paymentStats.pending, tone: 'warn' },
              { label: 'Rejected', value: paymentStats.rejected },
            ]}
          />
          <MetricPanel
            title="Tahap Check-in"
            description="Perbandingan exchange dan entrance."
            items={[
              { label: 'Exchange', value: checkinStats.exchange },
              { label: 'Entrance', value: checkinStats.entrance, tone: 'good' },
            ]}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Check-in Terbaru</CardTitle>
              <CardDescription>
                Tamu yang paling baru melewati scanner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Tahap</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : recentCheckins.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-muted-foreground h-24 text-center"
                      >
                        Belum ada aktivitas check-in.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentCheckins.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">
                              {item.guests?.full_name || '-'}
                            </p>
                            <p className="text-xs capitalize text-slate-500">
                              {item.guests?.guest_type || '-'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{item.events?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase">
                            {item.step}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatJakartaDate(item.checkin_time, 'PPP p')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Terbaru</CardTitle>
              <CardDescription>
                Snapshot event yang baru dibuat atau diubah terakhir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border px-4 py-4"
                  >
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>
                ))
              ) : recentEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-slate-500">
                  Belum ada event.
                </div>
              ) : (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border bg-slate-50/60 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{event.name}</p>
                        <p className="text-sm text-slate-500">
                          {formatJakartaDate(event.event_date, 'PPP')}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          event.public_reg_status === 'open'
                            ? 'border-emerald-200 text-emerald-700'
                            : ''
                        }
                      >
                        {event.public_reg_status === 'open' ? 'Buka' : 'Tutup'}
                      </Badge>
                    </div>
                    {role !== 'staff' && (
                      <div className="mt-3">
                        <Link href={`/admin/events/${event.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-0">
                            Buka Detail
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
