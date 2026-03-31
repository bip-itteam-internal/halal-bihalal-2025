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
import { Clock, ShieldAlert, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CheckinLogContent({ eventId }: { eventId?: string }) {
  const { checkins, loading } = useCheckins(eventId)

  return (
    <div className="space-y-6 p-6">
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[200px] font-bold text-slate-800">Waktu Scan</TableHead>
                <TableHead className="font-bold text-slate-800">Nama Tamu</TableHead>
                {!eventId && <TableHead className="font-bold text-slate-800">Event</TableHead>}
                <TableHead className="font-bold text-slate-800">Tahap (Step)</TableHead>
                <TableHead className="font-bold text-slate-800">Petugas (Scanner)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={eventId ? 4 : 5} className="h-16 animate-pulse bg-slate-50/50" />
                  </TableRow>
                ))
              ) : checkins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={eventId ? 4 : 5} className="h-32 text-center text-slate-500 italic">
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
                    <TableCell>
                      {log.staff ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                            {log.staff.full_name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{log.staff.full_name}</span>
                            <span className="text-[9px] text-slate-400">{log.staff.email}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" />
                          System/Legacy
                        </span>
                      )}
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
  const { loading, refresh } = useCheckins(eventId)

  const header = (
    <PageHeader
      title="Log Check-in Tamu"
      subtitle={eventId ? "Riwayat tamu untuk acara terpilih." : "Daftar riwayat seluruh tamu yang telah melakukan pemindaian QR Code."}
      backHref="/admin/events"
      actions={
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
      }
    />
  )

  return (
    <AppLayout header={header}>
      <CheckinLogContent eventId={eventId} />
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
