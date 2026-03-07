'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import { EventTicket } from '@/components/shared/EventTicket'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatJakartaDate } from '@/lib/utils'
import { Guest, Event as AppEvent } from '@/types'

interface TemplateProps {
  event: AppEvent
  guest: Guest
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onRSVP: (status: 'confirmed' | 'declined' | 'pending') => void
  isUpdating: boolean
}

export function ModernCorporate({
  event,
  guest,
  isOpen,
  setIsOpen,
  onRSVP,
  isUpdating,
}: TemplateProps) {
  if (!isOpen) {
    return (
      <motion.div
        key="cover-corp"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
        className="w-full max-w-md p-6"
      >
        <Card className="overflow-hidden border-none bg-white shadow-2xl">
          <div className="h-2 w-full bg-slate-900" />
          <CardContent className="flex flex-col items-center px-8 py-12 text-center">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 shadow-sm">
              {event.logo_url ? (
                <Image
                  src={event.logo_url}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-slate-400" />
              )}
            </div>

            <Badge
              variant="outline"
              className="mb-4 rounded-none border-slate-200 px-3 py-1 font-mono text-[10px] tracking-widest text-slate-500 uppercase"
            >
              Exclusive Invitation
            </Badge>

            <h1 className="mb-2 font-sans text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
              {event.name}
            </h1>
            <p className="mb-10 text-[10px] font-medium tracking-[0.3em] text-slate-400 uppercase">
              Bharata Internasional Pharmaceutical
            </p>

            <div className="mb-12 w-full border-y border-slate-100 py-6">
              <p className="mb-1 text-[11px] text-slate-400">Kepada Yth.</p>
              <p className="text-lg font-bold text-slate-900">
                {guest.full_name}
              </p>
            </div>

            <Button
              onClick={() => setIsOpen(true)}
              className="group h-14 w-full rounded-none bg-slate-900 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-slate-800"
            >
              Open Invitation
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="content-corp"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md p-6"
    >
      <Card className="overflow-hidden border-none bg-white shadow-2xl">
        <div className="flex bg-slate-900 p-6 text-white">
          <div className="flex-1">
            <h2 className="text-xl font-black tracking-tighter uppercase italic">
              {event.name}
            </h2>
            <p className="text-[10px] font-medium tracking-widest uppercase opacity-60">
              Event Details
            </p>
          </div>
          <Building2 className="h-6 w-6 opacity-40" />
        </div>

        <CardContent className="space-y-8 p-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-900">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Date
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {formatJakartaDate(event.event_date, 'PPP')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-900">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Time
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {formatJakartaDate(event.event_date, 'p')} WIB
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-900">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Location
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {event.location || 'TBA'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            {guest.rsvp_status === 'pending' ? (
              <div className="space-y-4">
                <p className="text-center text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  RSVP Confirmation
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => onRSVP('confirmed')}
                    disabled={isUpdating}
                    className="h-12 flex-1 rounded-none bg-slate-900 text-[11px] font-bold tracking-widest uppercase transition-all hover:bg-slate-800"
                  >
                    Confirm Presence
                  </Button>
                  <Button
                    onClick={() => onRSVP('declined')}
                    variant="outline"
                    className="h-12 flex-1 rounded-none border-slate-200 text-[11px] font-bold tracking-widest uppercase"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <EventTicket
                  eventName={event.name}
                  eventDate={formatJakartaDate(event.event_date, 'PPP')}
                  eventTime={`${formatJakartaDate(event.event_date, 'p')} WIB`}
                  location={event.location || 'TBA'}
                  guestName={guest.full_name || ''}
                  entryCode={guest.invitation_code || ''}
                  primaryColor="slate"
                  logoUrl={event.logo_url || undefined}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="h-10 w-full text-[9px] font-bold tracking-widest text-slate-400 uppercase"
          >
            Back to Cover
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
