'use client'

import { CalendarDays, MapPin, ScanLine } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { formatJakartaDate } from '@/lib/utils'
import { Event } from '@/types'

interface EventCardProps {
  event: Event
  eventCounts: { external: number; tenant: number }
  canManageEvent: boolean
}

export function EventCard({
  event,
  eventCounts,
  canManageEvent,
}: EventCardProps) {
  const showQuotaBars = event.event_type === 'public'

  const publicRegistered = eventCounts.external
  const publicQuotaTotal = event.external_quota ?? 0
  const publicPercent =
    publicQuotaTotal > 0
      ? Math.min(100, Math.round((publicRegistered / publicQuotaTotal) * 100))
      : 0

  const tenantRegistered = eventCounts.tenant
  const tenantQuotaTotal = event.tenant_quota ?? 0
  const tenantPercent =
    tenantQuotaTotal > 0
      ? Math.min(100, Math.round((tenantRegistered / tenantQuotaTotal) * 100))
      : 0

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0">
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
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

        {showQuotaBars && (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  Kuota Umum
                </span>
                <span className="text-muted-foreground">
                  {publicRegistered} / {publicQuotaTotal}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all"
                  style={{ width: `${publicPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  Kuota Tenant
                </span>
                <span className="text-muted-foreground">
                  {tenantRegistered} / {tenantQuotaTotal}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${tenantPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 mt-auto border-t p-3">
        <div
          className={`grid w-full grid-cols-1 gap-2 ${canManageEvent ? 'sm:grid-cols-2 2xl:grid-cols-3' : ''}`}
        >
          {canManageEvent && (
            <Link href={`/admin/events/${event.id}`} className="w-full">
              <Button variant="outline" className="w-full" size="sm">
                Kelola Event
              </Button>
            </Link>
          )}
          {canManageEvent && (
            <Link href={`/admin/events/${event.id}/guests`} className="w-full">
              <Button variant="outline" className="w-full" size="sm">
                Daftar Tamu
              </Button>
            </Link>
          )}
          <Link href={`/admin/scanner?event=${event.id}`} className="w-full">
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
  )
}
