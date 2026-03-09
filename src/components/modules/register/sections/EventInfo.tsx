'use client'

import { motion } from 'framer-motion'
import { Calendar, MapPin, Music2 } from 'lucide-react'
import { formatJakartaDate } from '@/lib/utils'

interface EventInfoProps {
  date?: string | Date
  location?: string
}

export function EventInfo({ date, location }: EventInfoProps) {
  // No local formatDate needed as we'll use formatJakartaDate directly

  return (
    <section className="relative z-20 mx-auto -mt-12 w-full max-w-6xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col gap-5 md:flex-row md:justify-center md:gap-8"
      >
        {[
          {
            icon: Calendar,
            label: 'WAKTU PELAKSANAAN',
            value: date ? formatJakartaDate(date, 'PPP') : 'TBA',
            sub: date
              ? `Pukul ${formatJakartaDate(date, 'p')} - Selesai`
              : 'TBA',
            color: 'from-amber-400 to-halal-primary',
          },
          {
            icon: MapPin,
            label: 'TEMPAT ACARA',
            value: location || 'TBA',
            color: 'from-emerald-400 to-teal-500',
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group hover:border-halal-primary/30 relative flex-1 overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d1f1e]/80 p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all"
          >
            {/* Animated Glow Backdrop */}
            <div className="bg-halal-primary/5 group-hover:bg-halal-primary/15 absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl transition-all" />

            <div className="relative z-10 space-y-8">
              <div className="text-halal-primary flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/5 shadow-xl transition-transform group-hover:rotate-6">
                <item.icon className="h-10 w-10" />
              </div>

              <div className="space-y-3">
                <p className="text-halal-primary text-xs font-black tracking-[0.4em] uppercase opacity-70">
                  {item.label}
                </p>
                <h3 className="group-hover:text-halal-primary text-3xl leading-tight font-bold text-white transition-colors">
                  {item.value}
                </h3>
                <p className="text-base font-medium text-zinc-500">
                  {item.sub}
                </p>
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div
              className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${item.color} transition-all duration-500 group-hover:w-full`}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
