'use client'

import { CalendarDays, ScanLine, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { formatJakartaDate } from '@/lib/utils'
import { Event } from '@/types'

interface EventCardProps {
  event: Event
  eventCounts: { external: number; tenant: number }
  canManageEvent: boolean
}

export function EventCard({ event, eventCounts, canManageEvent }: EventCardProps) {
  const remainingExternalQuota = Math.max(
    0,
    (event.external_quota ?? 0) - eventCounts.external,
  )
  const remainingTenantQuota = Math.max(
    0,
    (event.tenant_quota ?? 0) - eventCounts.tenant,
  )

  return (
    <Card className="flex h-full flex-col overflow-hidden border-slate-200 py-0 shadow-sm">
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-8 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border bg-white">
          {event.logo_url ? (
            <Image
              src={event.logo_url}
              alt={`Logo ${event.name}`}
              fill
              sizes="96px"
              className="object-contain p-3"
            />
          ) : (
            <CalendarDays className="h-10 w-10 text-slate-400" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
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
              variant="outline"
              className={
                event.public_reg_status === 'open'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-300 bg-slate-50 text-slate-600'
              }
            >
              {event.public_reg_status === 'open' ? 'Buka' : 'Tutup'}
            </Badge>
          </div>

          <CardTitle className="line-clamp-2 text-lg leading-tight text-slate-950">
            {event.name}
          </CardTitle>

          <div className="space-y-2 pt-1">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                {event.event_date
                  ? formatJakartaDate(event.event_date, 'PPP p')
                  : 'Waktu belum diatur'}
              </span>
            </div>

            {event.event_type === 'public' && (
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                <Users className="h-3.5 w-3.5" />
                <span>
                  Sisa kuota umum {remainingExternalQuota} • tenant {remainingTenantQuota}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto border-t bg-slate-50/70 p-4">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
          {canManageEvent && (
            <Link href={`/admin/events/${event.id}`} className="w-full">
              <Button variant="outline" className="w-full" size="sm">
                Detail
              </Button>
            </Link>
          )}
          {canManageEvent && (
            <Link href={`/admin/events/${event.id}/guests`} className="w-full">
              <Button variant="outline" className="w-full" size="sm">
                Guests
              </Button>
            </Link>
          )}
          <Link href={`/admin/scanner?event=${event.id}`} className="w-full">
            <Button
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              size="sm"
            >
              <ScanLine className="h-4 w-4" />
              Scanner
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
