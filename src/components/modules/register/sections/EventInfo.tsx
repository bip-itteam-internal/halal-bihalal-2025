'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Mic2 } from 'lucide-react'
import { formatJakartaDate } from '@/lib/utils'
import { EventGuestRule } from '@/types'

interface EventInfoProps {
  date?: string | Date
  location?: string
  guestRules?: EventGuestRule[]
}

export function EventInfo({ date, location, guestRules }: EventInfoProps) {
  // No local formatDate needed as we'll use formatJakartaDate directly

  return (
    <section className="relative z-20 mx-auto -mt-8 w-full max-w-6xl px-6 md:-mt-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
      >
        {[
          {
            icon: Calendar,
            label: 'WAKTU PELAKSANAAN',
            value: date ? formatJakartaDate(date, 'PPPP') : 'TBA',
            sub: (() => {
              const externalRule = guestRules?.find(
                (r) => r.guest_type === 'external',
              )
              const timeStr = externalRule?.start_time
                ? externalRule.start_time.substring(0, 5).replace(':', '.') +
                  ' WIB'
                : date
                  ? formatJakartaDate(date, 'p')
                  : 'TBA'
              return `Pukul ${timeStr} - Selesai`
            })(),
            color: 'from-amber-400 to-halal-primary',
            glow: 'rgba(234, 179, 8, 0.1)',
          },
          {
            icon: MapPin,
            label: 'TEMPAT ACARA',
            value: location || 'TBA',
            color: 'from-amber-400 to-halal-primary',
            glow: 'rgba(234, 179, 8, 0.1)',
          },
          {
            icon: Mic2,
            label: 'MASTER OF CEREMONY',
            value: 'TARMIN & SAMIDI',
            sub: 'Professional MC',
            image: '/TARMIN.png',
            color: 'from-amber-400 to-halal-primary',
            glow: 'rgba(234, 179, 8, 0.1)',
            span: 'md:col-span-2',
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className={`group hover:border-halal-primary/40 relative flex flex-col items-start overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a1a19] p-10 shadow-2xl transition-all duration-500 ${
              item.span || ''
            } ${item.image ? 'min-h-[400px] md:min-h-[280px]' : 'min-h-[320px]'}`}
          >
            {/* Background Glow Effect */}
            <div
              className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-10 blur-[100px] transition-opacity duration-500 group-hover:opacity-30"
              style={{ backgroundColor: 'rgba(234, 179, 8, 0.3)' }}
            />

            {/* Desktop Image Layer (Hidden on Mobile) */}
            {item.image && (
              <div className="absolute inset-0 z-0 hidden overflow-hidden transition-all duration-700 group-hover:scale-[1.02] md:block">
                <div className="absolute inset-x-0 top-0 h-full transition-opacity duration-700 md:right-0 md:left-auto md:w-1/2">
                  <Image
                    src={item.image}
                    alt={item.value}
                    fill
                    className="object-cover object-top contrast-110"
                  />
                  {/* Desktop Side Fade */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a19] via-[#0a1a19]/20 to-transparent" />
                </div>
                {/* Global Bottom Fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a19] via-transparent to-transparent" />
              </div>
            )}

            <div className="relative z-10 flex h-full w-full flex-col space-y-2">
              <div className="space-y-6">
                {/* Consistent Icon Container */}
                <div className="text-halal-primary group-hover:bg-halal-primary/20 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 shadow-inner backdrop-blur-md transition-all duration-500">
                  <item.icon className="h-7 w-7" />
                </div>

                {/* Standardized Text Content */}
                <div className="space-y-2">
                  <span className="text-halal-primary block text-[10px] font-black tracking-[0.4em] uppercase opacity-70">
                    {item.label}
                  </span>
                  <h3 className="text-2xl leading-tight font-bold text-white transition-colors duration-300 md:text-5xl">
                    {item.value}
                  </h3>
                  <p className="min-h-[1.5em] text-sm font-semibold text-zinc-400 transition-colors group-hover:text-zinc-300 md:text-lg">
                    {item.sub}
                  </p>

                  {/* Add Guest Rules here if it's the Date card */}
                  {item.label === 'WAKTU PELAKSANAAN' &&
                    guestRules &&
                    guestRules.length > 0 && (
                      <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                        {guestRules
                          .filter((rule) => rule.guest_type !== 'internal')
                          .map((rule) => (
                            <div
                              key={rule.guest_type}
                              className="flex items-center justify-between text-xs md:text-sm"
                            >
                              <span className="font-medium text-zinc-500">
                                {rule.guest_type === 'tenant'
                                  ? 'Open Gate Booth UMKM'
                                  : 'Open Gate Ticket Konser'}
                              </span>
                              <span className="text-halal-primary font-bold">
                                {rule.open_gate
                                  ? rule.open_gate
                                      .substring(0, 5)
                                      .replace(':', '.')
                                  : '--.--'}{' '}
                                WIB
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Mobile Image (Visible on Mobile only, at the bottom) */}
              {item.image && (
                <div className="relative -mx-10 mt-8 -mb-10 h-[350px] overflow-hidden md:hidden">
                  <Image
                    src={item.image}
                    alt={item.value}
                    fill
                    className="object-cover object-top contrast-110"
                  />
                  {/* Subtle blend for mobile image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a19] via-transparent to-transparent" />
                </div>
              )}
            </div>

            {/* Decorative Bottom Bar */}
            <div className="absolute right-0 bottom-0 left-0 h-[4px] overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="to-halal-primary h-full w-full bg-gradient-to-r from-amber-400" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
