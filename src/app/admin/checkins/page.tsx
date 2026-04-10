'use client'

import { useCheckins } from '@/hooks/use-checkins'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Clock, RefreshCcw, Download, Users, Music, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { CheckinLog } from '@/hooks/use-checkins'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function CheckinLogContent({ 
  eventId, 
  checkins, 
  loading,
  stats
}: { 
  eventId?: string, 
  checkins: CheckinLog[], 
  loading: boolean,
  stats: { totalExchange: number; totalEntrance: number; lastRefreshed: Date | null }
}) {

  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-blue-50/30 overflow-hidden relative">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center relative z-10">
            <div className="bg-blue-100 p-2 rounded-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase mb-1">Hadir Halal Bihalal</p>
            <p className="text-3xl font-black text-blue-700 leading-none">{stats.totalExchange}</p>
          </CardContent>
          <Users className="absolute -bottom-2 -right-2 h-16 w-16 text-blue-100/50 -rotate-12" />
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-emerald-50/30 overflow-hidden relative">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center relative z-10">
            <div className="bg-emerald-100 p-2 rounded-lg mb-3">
              <Music className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase mb-1">Masuk Konser</p>
            <p className="text-3xl font-black text-emerald-700 leading-none">{stats.totalEntrance}</p>
          </CardContent>
          <Music className="absolute -bottom-2 -right-2 h-16 w-16 text-emerald-100/50 -rotate-12" />
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-slate-50/40 overflow-hidden relative">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center relative z-10">
            <div className="bg-white p-2 rounded-lg mb-3 shadow-sm">
              <CalendarClock className="h-5 w-5 text-slate-500" />
            </div>
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-1">Terakhir Refresh</p>
            <p className="text-lg font-black text-slate-700 leading-none">
              {stats.lastRefreshed 
                ? format(stats.lastRefreshed, 'HH:mm:ss', { locale: id })
                : '-'
              }
            </p>
            <p className="text-[9px] text-slate-400 mt-2 italic font-medium">Auto-updated</p>
          </CardContent>
          <CalendarClock className="absolute -bottom-2 -right-2 h-16 w-16 text-slate-100/60 -rotate-12" />
        </Card>
      </div>
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[200px] font-bold text-slate-800">Waktu Scan</TableHead>
                <TableHead className="font-bold text-slate-800">Nama Tamu</TableHead>
                {!eventId && <TableHead className="font-bold text-slate-800">Event</TableHead>}
                <TableHead className="font-bold text-slate-800">Tahap (Step)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={eventId ? 3 : 4} className="h-16 animate-pulse bg-slate-50/50" />
                  </TableRow>
                ))
              ) : checkins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={eventId ? 3 : 4} className="h-32 text-center text-slate-500 italic">
                    Belum ada riwayat check-in untuk kriteria ini.
                  </TableCell>
                </TableRow>
              ) : (
                checkins.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {format(new Date(log.checkin_time), 'HH:mm:ss', { locale: id })}
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(log.checkin_time), 'dd MMM', { locale: id })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{log.guests?.full_name}</span>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                          {log.guests?.guest_type}
                        </span>
                      </div>
                    </TableCell>
                    {!eventId && (
                      <TableCell className="text-slate-600 font-medium">
                        {log.events?.name}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge 
                        variant={log.step === 'exchange' ? 'secondary' : 'default'}
                        className={
                          log.step === 'exchange' 
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100'
                        }
                      >
                        {log.guests?.guest_type === 'tenant' 
                          ? 'Masuk Konser' 
                          : log.step === 'exchange' 
                            ? 'Hadir Halal Bihalal' 
                            : 'Masuk Konser'
                        }
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function PageWithParams() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('event_id') || undefined
  const [stepFilter, setStepFilter] = useState<string>('all')
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const { checkins, loading, refresh } = useCheckins(eventId)

  // Update lastRefreshed when loading completes
  useEffect(() => {
    if (!loading) {
      setLastRefreshed(new Date())
    }
  }, [loading])

  // Memoized stats
  const stats = useMemo(() => {
    return {
      totalExchange: checkins.filter(c => c.step === 'exchange').length,
      totalEntrance: checkins.filter(c => c.step === 'entrance').length,
      lastRefreshed
    }
  }, [checkins, lastRefreshed])

  // Memoized filtered checkins
  const filteredCheckins = useMemo(() => {
    if (stepFilter === 'all') return checkins
    return checkins.filter(log => log.step === stepFilter)
  }, [checkins, stepFilter])

  const handleDownload = () => {
    if (filteredCheckins.length === 0) {
      alert('Tidak ada data untuk diunduh.')
      return
    }

    const dataToExport = filteredCheckins.map((log) => ({
      'Nama Lengkap': log.guests?.full_name || '-',
      'No. WhatsApp': log.guests?.phone || '-',
      'Email': log.guests?.email || '-',
      'Ukuran Kaos': log.guests?.shirt_size || '-',
      'Perusahaan / Instansi': log.guests?.address || (log.guests?.metadata as Record<string, any>)?.company || '-',
      'Tipe Tamu': log.guests?.guest_type || '-',
      'Tahap Cekin': log.guests?.guest_type === 'tenant' 
        ? 'Masuk Konser' 
        : log.step === 'exchange' 
          ? 'Hadir Halal Bihalal' 
          : 'Masuk Konser',
      'Waktu Cekin': format(new Date(log.checkin_time), 'yyyy-MM-dd HH:mm:ss'),
      'Event': log.events?.name || '-'
    }))

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Checkins')

    // Generate filename based on step
    const stepLabel = stepFilter === 'exchange' 
      ? 'Halal-Bihalal' 
      : stepFilter === 'entrance' 
        ? 'Masuk-Konser' 
        : 'Semua-Tahap'
    
    const timestamp = format(new Date(), 'yyyyMMdd-HHmm')
    const filename = `Cekin-${stepLabel}-${timestamp}.xlsx`

    // Download file
    XLSX.writeFile(workbook, filename)
  }

  const header = (
    <PageHeader
      title="Log Check-in Tamu"
      subtitle={eventId ? "Riwayat tamu untuk acara terpilih." : "Daftar riwayat seluruh tamu yang telah melakukan pemindaian QR Code."}
      backHref="/admin/events"
      actions={
        <div className="flex items-center gap-2">
          <Select value={stepFilter} onValueChange={setStepFilter}>
            <SelectTrigger className="h-9 w-[180px] text-xs font-semibold border-slate-200">
              <SelectValue placeholder="Semua Tahap" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahap</SelectItem>
              <SelectItem value="exchange">Hadir Halal Bihalal</SelectItem>
              <SelectItem value="entrance">Masuk Konser</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            disabled={loading || filteredCheckins.length === 0}
            className="gap-2 h-9 px-4 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download Excel</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh} 
            disabled={loading}
            className="gap-2 h-9 px-4"
          >
            <RefreshCcw className={loading ? 'animate-spin h-4 w-4' : 'h-4 w-4'} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      }
    />
  )

  return (
    <AppLayout header={header}>
      <CheckinLogContent 
        eventId={eventId} 
        checkins={filteredCheckins} 
        loading={loading} 
        stats={stats}
      />
    </AppLayout>
  )
}

export default function CheckinLogPage() {
  return (
    <Suspense fallback={<div className="p-6">Memuat halaman...</div>}>
      <PageWithParams />
    </Suspense>
  )
}
