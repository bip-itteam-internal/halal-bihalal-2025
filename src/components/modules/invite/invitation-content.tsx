'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import QRCode from 'react-qr-code'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatJakartaDate } from '@/lib/utils'
import { Guest, Event as AppEvent } from '@/types'

interface InvitationContentProps {
  event: AppEvent | null
  guest: Guest | null
  primaryColor: string
  secondaryColor: string
  isUpdating: boolean
  onRSVP: (status: 'confirmed' | 'declined') => void
  onBack: () => void
}

export function InvitationContent({
  event,
  guest,
  primaryColor,
  secondaryColor,
  isUpdating,
  onRSVP,
  onBack,
}: InvitationContentProps) {
  return (
    <motion.div
      key="content"
      initial={{ opacity: 0, scale: 1.05, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 w-full max-w-[340px]"
    >
      <Card className="overflow-hidden rounded-[3rem] border-none bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
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

        <CardContent className="space-y-6 p-7">
          <div className="space-y-2 text-center">
            <Badge
              variant="outline"
              className="h-5 rounded-full border-emerald-100 bg-emerald-50/50 text-[8px] tracking-[0.2em] text-emerald-700 uppercase"
            >
              Official Invitation
            </Badge>
            <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">
              {event?.name}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              {
                icon: Calendar,
                label: 'Tanggal',
                value: event?.event_date
                  ? formatJakartaDate(event.event_date, 'PPP')
                  : '',
              },
              {
                icon: Clock,
                label: 'Waktu',
                value: event?.event_date
                  ? formatJakartaDate(event.event_date, 'p')
                  : '',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-2xl border border-slate-50 bg-[#fafafa] p-3"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-50 bg-white shadow-sm"
                  style={{ color: primaryColor }}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <div className="mt-1">
                  <p className="text-[8px] font-bold tracking-widest text-slate-400 uppercase">
                    {item.label}
                  </p>
                  <p className="truncate text-[10px] font-bold text-slate-800">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-50 bg-[#fafafa] p-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-50 bg-white shadow-sm"
              style={{ color: primaryColor }}
            >
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[8px] leading-none font-bold tracking-widest text-slate-400 uppercase">
                Lokasi
              </p>
              <p className="truncate text-[10px] font-bold text-slate-800">
                {event?.location || 'Lokasi menyusul'}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {guest?.rsvp_status === 'pending' ? (
              <motion.div
                key="rsvp"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-2"
              >
                <p className="mb-4 text-center text-[9px] font-black tracking-widest text-slate-400 uppercase">
                  Konfirmasi Kehadiran
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="h-10 rounded-full text-[10px] font-bold tracking-wider text-white uppercase shadow-lg transition-transform active:scale-95"
                    style={{
                      backgroundColor: primaryColor,
                      boxShadow: `0 10px 20px -5px ${primaryColor}40`,
                    }}
                    disabled={isUpdating}
                    onClick={() => onRSVP('confirmed')}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Hadir'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 rounded-full border-slate-200 text-[10px] font-bold tracking-wider uppercase hover:bg-slate-50 active:scale-95"
                    onClick={() => onRSVP('declined')}
                  >
                    Absen
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="ticket"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="relative flex flex-col items-center rounded-[2.5rem] border border-[#e0f1e9] bg-[#f0fff9] p-6 shadow-inner shadow-[#e0f1e9]/50">
                  <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-emerald-300" />
                  <div className="mb-5 text-center">
                    <div className="mb-0.5 text-[10px] font-black tracking-tight text-emerald-800 uppercase">
                      Digital Pass
                    </div>
                    <p className="text-[7px] font-bold tracking-[0.3em] text-emerald-600 uppercase">
                      Confirmed Access
                    </p>
                  </div>
                  <div className="mb-4 rounded-2xl border border-white bg-white p-3 shadow-[0_20px_40px_-10px_rgba(0,146,98,0.2)]">
                    <QRCode
                      value={guest?.invitation_code || ''}
                      size={120}
                      fgColor={primaryColor}
                      bgColor="#ffffff"
                      level="M"
                    />
                  </div>
                  <code className="rounded-full border border-emerald-100 bg-white px-5 py-1 text-[11px] font-black tracking-[0.4em] text-emerald-800 shadow-sm">
                    {guest?.invitation_code}
                  </code>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <div className="border-t border-slate-50 p-4 text-center">
          <p className="text-[8px] font-bold tracking-[0.3em] text-slate-300 uppercase">
            Bharata Group Official Event
          </p>
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-center"
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-full text-[9px] font-black tracking-widest text-slate-400 uppercase"
          onClick={onBack}
        >
          Back to Cover
        </Button>
      </motion.div>
    </motion.div>
  )
}
