'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Event, EventGuestRule } from '@/types'
import { EventCountdown } from './sections/EventCountdown'

export interface LandingClientV2Props {
  events: Event[]
  guestRules: EventGuestRule[]
}

export function LandingClientV2({ events, guestRules }: LandingClientV2Props) {
  const mainEvent = events?.[0]
  const mainImagePath = '/poster.jpeg'

  // Calculate Internal Open Gate Logic
  const targetDate = React.useMemo(() => {
    if (!mainEvent) return new Date()
    const internalRule = guestRules?.find(
      (r) => r.guest_type === 'internal' && r.event_id === mainEvent.id,
    )
    const openGateTime = internalRule?.open_gate || '08:00:00'
    const datePart = mainEvent.event_date.split(/[T ]/)[0]
    return new Date(`${datePart}T${openGateTime}`)
  }, [mainEvent, guestRules])

  return (
    <div className="bg-halal-secondary flex min-h-screen w-full flex-col overflow-x-hidden scroll-smooth font-sans">
      {/* HEADER COUNTDOWN (TOP - COMPACT) */}
      <div className="sticky top-0 z-50 w-full">
        <EventCountdown
          targetDate={targetDate}
          eventName="Menuju Acara"
          compact={true}
        />
      </div>

      {/* SECTION 1: POSTER (Truly Full Width & Scrollable) */}
      <div className="relative mt-0 flex w-full flex-col items-center justify-start pt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 w-full"
        >
          {/* Image fills the width and scales height naturally */}
          <div className="relative w-full">
            <Image
              src={mainImagePath}
              alt={mainEvent?.name || 'Event Poster'}
              width={1920}
              height={2560}
              className="block h-auto w-full object-contain" // No height limit, full width
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* Atmospheric Decorations */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-multiply grayscale"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/islamic-exercise.png")`,
            backgroundSize: '400px',
          }}
        />
      </div>
    </div>
  )
}
