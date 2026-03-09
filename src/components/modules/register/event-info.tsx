'use client'

import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import Image from 'next/image'
import { formatJakartaDate } from '@/lib/utils'
import { Event } from '@/types'

interface EventInfoProps {
  event: Event
}

export function EventInfo({ event }: EventInfoProps) {
  return (
    <div className="space-y-5">
      <div className="bg-muted relative mx-auto w-full overflow-hidden rounded-lg border lg:mx-0 lg:max-w-[260px]">
        <div className="relative aspect-[1/1] w-full">
          {event?.logo_url ? (
            <Image
              src={event.logo_url}
              alt={`Poster ${event?.name || 'event'}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-5"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center">
              <Ticket className="h-10 w-10" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="line-clamp-3 text-2xl leading-tight font-bold md:text-3xl">
          {event?.name || 'Registrasi Event'}
        </h1>
      </div>

      {event?.event_date && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4" />
          <span>{formatJakartaDate(event.event_date, 'PPP p')}</span>
        </div>
      )}
      {event?.location && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
      )}
    </div>
  )
}
