'use client'

import { CalendarDays, ScanLine, History, DoorOpen } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
  CardHeader,
} from '@/components/ui/card'
import { cn, formatJakartaDate } from '@/lib/utils'
import { Event } from '@/types'

interface EventCardProps {
  event: Event
  canManageEvent: boolean
}

export function EventCard({
  event,
  canManageEvent,
}: EventCardProps) {
  // Get open gate times
  const internalRule = event.event_guest_rules?.find(
    (r) => r.guest_type === 'internal',
  )
  const externalRule = event.event_guest_rules?.find(
    (r) => r.guest_type === 'external',
  )

  const intOpen = internalRule?.open_gate
  const extOpen = externalRule?.open_gate
  const isSameOpen = intOpen === extOpen

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-slate-200 py-0 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 shadow-inner">
          {event.logo_url ? (
            <Image
              src={event.logo_url}
              alt={`Logo ${event.name}`}
              fill
              sizes="64px"
              className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <CalendarDays className="h-7 w-7 text-slate-300" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                'h-5 px-1.5 text-[9px] font-bold tracking-wider uppercase',
                event.event_type === 'public'
                  ? 'border-sky-100 bg-sky-50 text-sky-600'
                  : 'border-amber-100 bg-amber-50 text-amber-600',
              )}
            >
              {event.event_type === 'public' ? 'Publik' : 'Internal'}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'h-5 px-1.5 text-[9px] font-bold tracking-wider uppercase',
                event.public_reg_status === 'open'
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                  : 'border-slate-100 bg-slate-50 text-slate-500',
              )}
            >
              {event.public_reg_status === 'open' ? 'Buka' : 'Tutup'}
            </Badge>
          </div>
          <CardTitle className="line-clamp-2 text-sm leading-tight font-bold text-slate-900 group-hover:text-emerald-700">
            {event.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="mt-[-15px] flex-1 space-y-1.5 px-5 pb-5">
        {/* Date Detail */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-50 text-slate-400">
            <CalendarDays className="h-3 w-3" />
          </div>
          <span>
            {event.event_date
              ? formatJakartaDate(event.event_date, 'PPPP')
              : 'Waktu belum diatur'}
          </span>
        </div>

        {/* Gate Details */}
        {(intOpen || extOpen) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500">
            {intOpen && (
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-50 text-sky-500">
                  <DoorOpen className="h-3 w-3" />
                </div>
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">Gate Int:</span>
                  <span className="font-bold text-sky-700">
                    {intOpen.substring(0, 5)}
                  </span>
                </span>
              </div>
            )}

            {extOpen && !isSameOpen && (
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-500">
                  <DoorOpen className="h-3 w-3" />
                </div>
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">Gate Ext:</span>
                  <span className="font-bold text-emerald-700">
                    {extOpen.substring(0, 5)}
                  </span>
                </span>
              </div>
            )}

            {isSameOpen && intOpen && (
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-500">
                  <DoorOpen className="h-3 w-3" />
                </div>
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">Open Gate:</span>
                  <span className="font-bold text-emerald-700">
                    {intOpen.substring(0, 5)}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 bg-slate-50/50 p-4">
        {canManageEvent && (
          <>
            <Link
              href={`/admin/events/${event.id}`}
              className="min-w-[80px] flex-1"
            >
              <Button
                variant="outline"
                className="w-full text-[11px] font-bold hover:bg-white"
                size="sm"
              >
                Detail
              </Button>
            </Link>
            <Link
              href={`/admin/events/${event.id}/guests`}
              className="min-w-[80px] flex-1"
            >
              <Button
                variant="outline"
                className="w-full text-[11px] font-bold hover:bg-white"
                size="sm"
              >
                Guests
              </Button>
            </Link>
          </>
        )}
        <Link
          href={`/admin/scanner?event=${event.id}`}
          className={cn(
            'min-w-[100px] flex-1',
            !canManageEvent && 'flex-[1.5]',
          )}
        >
          <Button
            className="w-full bg-emerald-600 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700"
            size="sm"
          >
            <ScanLine className="mr-1.5 h-3.5 w-3.5" />
            Scanner
          </Button>
        </Link>
        <Link
          href={`/admin/checkins?event_id=${event.id}`}
          className="min-w-[80px] flex-1"
        >
          <Button
            variant="outline"
            className="w-full text-[11px] font-bold hover:bg-white hover:text-emerald-700"
            size="sm"
          >
            <History className="mr-1.5 h-3.5 w-3.5" />
            Logs
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
