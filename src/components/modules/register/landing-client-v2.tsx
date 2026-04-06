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
  
  // You can choose which image to show as the main V2 visual.
  // Using poster.jpeg by default as requested "hanya menampilkan gambar".
  const mainImagePath = '/poster.jpeg'

  return (
    <div className="theme-halal bg-halal-secondary relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden font-sans">
      {/* Atmosphere Layer - Consistent with Ivory Premium */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] via-[#F6E8CD] to-[#FFFDF5]" />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-multiply grayscale"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/islamic-exercise.png")`,
            backgroundSize: '400px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(var(--halal-primary-rgb),0.1)_0%,_transparent_70%)]" />
      </div>

      {/* Poster Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl px-4 md:px-0"
      >
        <div className="group relative overflow-hidden rounded-[2rem] bg-white/20 p-2 shadow-2xl shadow-halal-primary/20 ring-1 ring-white/40 backdrop-blur-3xl">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.8rem] md:aspect-auto">
             <Image
              src={mainImagePath}
              alt={mainEvent?.name || 'Event Poster'}
              width={1200}
              height={1600}
              className="h-auto w-full object-contain transition-transform duration-1000 group-hover:scale-105"
              priority
            />
          </div>
          
          {/* Subtle Glow Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        </div>
        
        {/* Footnote or simple indicator if needed, but keeping it "image only" as requested */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <span className="text-[10px] font-black tracking-[0.8em] text-halal-primary uppercase opacity-40">
            {mainEvent?.name || 'Exclusive Event Invitation'}
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}
