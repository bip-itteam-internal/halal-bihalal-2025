'use client'

import { CalendarDays, ScanLine, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { cn, formatJakartaDate } from '@/lib/utils'
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
      <CardContent className="flex flex-1 flex-row items-center gap-4 px-4 py-4 text-left">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white shadow-sm">
          {event.logo_url ? (
            <Image
              src={event.logo_url}
              alt={`Logo ${event.name}`}
              fill
              sizes="80px"
              className="object-contain p-2"
            />
          ) : (
            <CalendarDays className="h-8 w-8 text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                'h-5 px-1.5 text-[10px] font-medium capitalize',
                event.event_type === 'public'
                  ? 'border-sky-200 bg-sky-50 text-sky-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700',
              )}
            >
              {event.event_type === 'public' ? 'Publik' : 'Internal'}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'h-5 px-1.5 text-[10px] font-medium',
                event.public_reg_status === 'open'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600',
              )}
            >
              {event.public_reg_status === 'open' ? 'Buka' : 'Tutup'}
            </Badge>
          </div>

          <CardTitle className="text-base leading-snug font-bold text-slate-950">
            {event.name}
          </CardTitle>

          <div className="flex flex-col gap-1.5 pt-0.5">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-slate-100/80 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <CalendarDays className="h-3 w-3" />
              <span>
                {event.event_date
                  ? formatJakartaDate(event.event_date, 'PPPP')
                  : 'Waktu belum diatur'}
              </span>
            </div>

            {event.event_type === 'public' && (
              <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-slate-100/80 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                <Users className="h-3 w-3" />
                <span>
                  Sisa kuota umum {remainingExternalQuota} • tenant{' '}
                  {remainingTenantQuota}
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
