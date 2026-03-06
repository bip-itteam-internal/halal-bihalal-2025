'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { PartyPopper } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Guest, Event as AppEvent } from '@/types'

interface InvitationCoverProps {
  event: AppEvent | null
  guest: Guest | null
  primaryColor: string
  secondaryColor: string
  onOpen: () => void
}

export function InvitationCover({
  event,
  guest,
  primaryColor,
  secondaryColor,
  onOpen,
}: InvitationCoverProps) {
  return (
    <motion.div
      key="cover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 w-full max-w-[340px]"
    >
      <Card className="overflow-hidden rounded-[3rem] border-none bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all">
        {/* Top Accent Bar */}
        <div className="flex h-1.5 w-full">
          <div
            className="h-full flex-1"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="h-full flex-1"
            style={{ backgroundColor: secondaryColor }}
          />
        </div>

        <CardContent className="flex flex-col items-center p-8 pt-0">
          {/* Hanging Props */}
          <div className="flex h-16 w-full items-start justify-between px-4 pb-6">
            <div className="flex flex-col items-center">
              <div className="h-6 w-px bg-slate-200" />
              <div className="h-3 w-3 rounded-full bg-[#fbbc05]" />
            </div>
            <div className="mt-2 flex flex-col items-center">
              <div className="h-3 w-px bg-slate-200" />
              <div className="h-4 w-4 rotate-45 bg-[#009262] shadow-sm shadow-[#009262]/20" />
            </div>
            <div className="flex flex-col items-center">
              <div className="h-6 w-px bg-slate-200" />
              <div className="h-3 w-3 rounded-full bg-[#4285f4]" />
            </div>
          </div>

          {/* Cover Main Info */}
          <div className="flex flex-col items-center space-y-7 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {event?.logo_url ? (
                <Image
                  src={event.logo_url}
                  alt="Event Logo"
                  width={120}
                  height={56}
                  className="h-14 w-auto object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <PartyPopper className="h-6 w-6" />
                </div>
              )}
            </motion.div>

            <div className="space-y-1.5">
              <h2 className="text-[20px] leading-[1.1] font-black tracking-tight text-[#1a1c1e] uppercase">
                {event?.name}
              </h2>
              <p className="max-w-[180px] text-[9px] leading-relaxed font-bold tracking-[0.2em] text-[#8e9196] uppercase">
                PT Bharata Internasional Pharmaceutical
              </p>
            </div>

            <div className="w-full space-y-1 py-6">
              <p className="text-[10px] font-medium text-slate-400 italic">
                Kepada Bapak/Ibu/Saudara/i:
              </p>
              <h1 className="text-[20px] font-bold tracking-tight text-[#1a1c1e]">
                {guest?.full_name}
              </h1>
            </div>

            <Button
              className="h-12 w-full rounded-full bg-[#009262] text-[11px] font-black tracking-widest text-white uppercase shadow-[0_15px_30px_-5px_rgba(0,146,98,0.3)] transition-all hover:scale-[1.02] hover:bg-[#007f56] active:scale-95"
              onClick={onOpen}
            >
              Buka Undangan
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
