'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  CalendarDays,
  Gift,
  ArrowRight,
  RotateCw,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AppLayout } from '@/components/layout/app-layout'
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
  DashboardRecentCheckin,
  getDashboardData,
} from '@/services/api/dashboard'

type QuickAction = {
  href: string
  label: string
  description: string
  icon: React.ReactNode
}


export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [recentCheckins, setRecentCheckins] = useState<
    DashboardRecentCheckin[]
  >([])
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
          subtitle="Ringkasan pendaftaran dan aktivitas acara."
        />
      }
    >
      <div className="flex-1 space-y-6 p-5 pt-4">
        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Shortcut Navigasi</CardTitle>
              <CardDescription>Pilih modul operasional untuk memulai.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="group flex items-center justify-between rounded-2xl border bg-white p-5 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-slate-100 p-3 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600">
                        {action.icon}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 leading-tight">
                          {action.label}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Masuk ke modul
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>


        <div className="grid gap-6">
          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Aktivitas Check-in Terbaru</CardTitle>
              <CardDescription>
                Tamu yang baru saja melakukan check-in di lokasi.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboard()}
              disabled={loading}
              className="h-8 gap-2 px-3"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
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
                        <TableCell>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-36" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
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
                            <p className="text-xs text-slate-500 capitalize">
                              {item.guests?.guest_type || '-'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{item.events?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-[10px]">
                            {item.step}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {formatJakartaDate(item.checkin_time, 'p')} - {formatJakartaDate(item.checkin_time, 'MMM d')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
