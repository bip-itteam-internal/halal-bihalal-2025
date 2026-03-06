'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, CalendarDays, MapPin, ScanLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/layout/app-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { formatJakartaDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { CreateEventSheet } from '@/components/modules/events/create-event-sheet'

interface EventData {
  id: string
  name: string
  public_name: string
  company_name: string
  logo_url: string | null
  event_type: 'internal' | 'public' | null
  description: string
  event_date: string
  location: string
  dress_code: string
  external_quota: number
  public_reg_status: string
}

export default function EventsPage() {
  const supabase = createClient()
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Manajemen Event
            </h2>
            <p className="text-muted-foreground">
              Buat dan kelola seluruh daftar acara yang terdaftar di sistem.
            </p>
          </div>

          <CreateEventSheet onSuccess={fetchEvents} />
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-4/5" />
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center">
                    <Skeleton className="mr-2 h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="mr-2 h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <Skeleton className="mb-2 h-3 w-20" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <div>
                      <Skeleton className="mb-2 h-3 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-12 text-center">
            <p>
              Belum ada event. Klik &quot;Buat Event&quot; untuk menambahkan.
            </p>
            <CreateEventSheet
              onSuccess={fetchEvents}
              trigger={
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Baru
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {events.map((event) => (
              <Card
                key={event.id}
                className="flex flex-col gap-0 overflow-hidden py-0"
              >
                <div className="bg-muted relative aspect-square border-b">
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        event.event_type === 'public'
                          ? 'border-sky-300 bg-sky-50 text-sky-700 capitalize'
                          : 'border-amber-300 bg-amber-50 text-amber-700 capitalize'
                      }
                    >
                      {event.event_type === 'public' ? 'Publik' : 'Internal'}
                    </Badge>
                    <Badge
                      className={
                        event.public_reg_status === 'open'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-red-500 bg-red-50 text-red-700'
                      }
                    >
                      {event.public_reg_status === 'open' ? 'Buka' : 'Tutup'}
                    </Badge>
                  </div>
                  {event.logo_url ? (
                    <Image
                      src={event.logo_url}
                      alt={`Poster ${event.name}`}
                      fill
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-100 to-blue-200 text-sky-700">
                      <CalendarDays className="h-10 w-10" />
                      <span className="text-xs font-medium tracking-wide uppercase">
                        Event
                      </span>
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl leading-tight">
                        {event.name}
                      </CardTitle>
                      {event.public_name && (
                        <p className="text-muted-foreground mt-1 text-sm font-medium italic">
                          Publik: {event.public_name}
                        </p>
                      )}
                      {event.company_name && (
                        <p className="text-muted-foreground text-xs uppercase">
                          {event.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <CardDescription className="mt-1.5 line-clamp-2">
                    {event.description || 'Tidak ada deskripsi.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 px-4 pb-3">
                  <div className="text-muted-foreground flex items-center text-sm">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {event.event_date
                      ? formatJakartaDate(event.event_date, 'PPP p')
                      : 'TBA'}
                  </div>
                  <div className="text-muted-foreground flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location || 'TBA'}
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3 border-t pt-3">
                    <div>
                      <p className="text-muted-foreground text-xs tracking-wider uppercase">
                        Kuota Eksternal
                      </p>
                      <p className="font-semibold">{event.external_quota}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs tracking-wider uppercase">
                        Dress Code
                      </p>
                      <p className="truncate font-semibold">
                        {event.dress_code || '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 mt-auto border-t p-3">
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
                    <Link href={`/admin/events/${event.id}`} className="w-full">
                      <Button variant="outline" className="w-full" size="sm">
                        Kelola Event
                      </Button>
                    </Link>
                    <Link
                      href={`/admin/guests?event=${event.id}`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full" size="sm">
                        Daftar Tamu
                      </Button>
                    </Link>
                    <Link
                      href={`/admin/scanner?event=${event.id}`}
                      className="w-full"
                    >
                      <Button
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                        size="sm"
                      >
                        <ScanLine className="h-4 w-4" />
                        Scan
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
