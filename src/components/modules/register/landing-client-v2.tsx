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
  const mainImagePath = '/fix.jpeg'

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

      {/* Floating WhatsApp Contact (Bottom Right) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5, type: 'spring' }}
        className="fixed right-6 bottom-6 z-[60] md:right-10 md:bottom-10"
      >
        <a
          href="https://wa.me/6289676258026?text=Halo%20Panitia%20(Fariz),%20saya%20ingin%20bertanya%20mengenai%20acara%20Halal%20Bihalal%20dan%20Konser%20Charly%20Setia%20Band%202026."
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3"
        >
          {/* Label (Visible on Hover) */}
          <span className="pointer-events-none translate-x-4 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-slate-800 opacity-0 shadow-xl ring-1 ring-black/5 backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            Kontak Panitia (Fariz)
          </span>

          {/* Button Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_40px_rgba(37,211,102,0.4)] transition-transform duration-300 hover:scale-110 active:scale-95">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </a>
      </motion.div>
    </div>
  )
}
