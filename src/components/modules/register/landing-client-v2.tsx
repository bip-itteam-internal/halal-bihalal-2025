'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Event, EventGuestRule } from '@/types'

export interface LandingClientV2Props {
  events: Event[]
  guestRules: EventGuestRule[]
}

export function LandingClientV2({ events }: LandingClientV2Props) {
  const mainEvent = events?.[0]
  const mainImagePath = '/poster.jpeg'

  return (
    <div className="bg-halal-secondary relative h-screen w-full overflow-hidden font-sans">
      {/* Immersive Full Screen Image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-full w-full"
      >
        <Image
          src={mainImagePath}
          alt={mainEvent?.name || 'Event Poster'}
          fill
          className="object-cover"
          priority
        />
        
        {/* Subtle Vignette for Premium Feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </motion.div>
      
      {/* Very Subtle Branding overlay if needed */}
      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-[10px] font-black tracking-[0.8em] text-white uppercase shadow-sm"
        >
          {mainEvent?.name}
        </motion.p>
      </div>
    </div>
  )
}
