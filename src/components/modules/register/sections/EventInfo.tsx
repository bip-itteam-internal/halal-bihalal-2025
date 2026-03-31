'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Mic2, Users, Music } from 'lucide-react'
import { formatJakartaDate } from '@/lib/utils'
import { EventGuestRule } from '@/types'

interface EventInfoProps {
  date?: string | Date
  location?: string
  guestRules?: EventGuestRule[]
}

export function EventInfo({ date, location, guestRules }: EventInfoProps) {
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

            customContent: guestRules && guestRules.length > 0 && (
              <div className="mt-6 flex flex-col gap-3 border-t border-white/5 pt-6">
                <div className="flex flex-col gap-2">
                  {guestRules
                    .filter((rule) =>
                      ['internal', 'external'].includes(rule.guest_type),
                    )
                    .sort((a, b) => {
                      const order = { internal: 0, external: 1 }
                      return (
                        (order[a.guest_type as keyof typeof order] ?? 99) -
                        (order[b.guest_type as keyof typeof order] ?? 99)
                      )
                    })
                    .map((rule) => {
                      const isInternal = rule.guest_type === 'internal'
                      const Icon =
                        rule.guest_type === 'internal' ? Users : Music

                      return (
                        <div
                          key={rule.guest_type}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 backdrop-blur-sm transition-colors ${
                            isInternal
                              ? 'border-sky-500/30 bg-sky-500/5'
                              : 'border-halal-primary/20 bg-halal-primary/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                isInternal
                                  ? 'bg-sky-500/20 text-sky-400'
                                  : 'bg-halal-primary/20 text-halal-primary'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
                              {isInternal
                                ? 'Open Gate Internal'
                                : 'Open Gate Umum'}
                            </span>
                          </div>
                          <span
                            className={`font-black md:text-lg ${
                              isInternal ? 'text-sky-400' : 'text-halal-primary'
                            }`}
                          >
                            {rule.open_gate
                              ? rule.open_gate.substring(0, 5).replace(':', '.')
                              : '--.--'}{' '}
                            WIB
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>
            ),
          },
          {
            icon: MapPin,
            label: 'TEMPAT ACARA',
            value: location || 'TBA',
          },
          {
            icon: Mic2,
            label: 'MASTER OF CEREMONY',
            value: 'TARMIN & SAMIDI',
            sub: 'Professional MC',
            image: '/tarmin (2).png',
            span: 'md:col-span-2',
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className={`group hover:border-halal-primary/40 relative flex flex-col items-start overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a1a19] p-10 shadow-2xl transition-all duration-500 ${
              'span' in item && item.span ? item.span : ''
            } ${item.image ? 'min-h-[400px] md:min-h-[280px]' : 'min-h-[320px]'}`}
          >
            {/* Background Glow Effect */}
            <div
              className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-10 blur-[100px] transition-opacity duration-500 group-hover:opacity-30"
              style={{ backgroundColor: 'rgba(234, 179, 8, 0.3)' }}
            />

            {/* Desktop Image Layer */}
            {item.image && (
              <div className="absolute inset-0 z-0 hidden overflow-hidden transition-all duration-700 group-hover:scale-[1.02] md:block">
                <div className="absolute inset-x-0 top-0 h-full transition-opacity duration-700 md:right-0 md:left-auto md:w-1/2">
                  <Image
                    src={item.image}
                    alt={item.value}
                    fill
                    className="object-cover object-top contrast-110"
                    style={{
                      maskImage:
                        'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
                      WebkitMaskImage:
                        'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a19] via-[#0a1a19]/20 to-transparent" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a19] via-transparent to-transparent" />
              </div>
            )}

            <div className="relative z-10 flex h-full w-full flex-col space-y-2">
              <div className="space-y-6">
                <div className="text-halal-primary group-hover:bg-halal-primary/20 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 shadow-inner backdrop-blur-md transition-all duration-500">
                  <item.icon className="h-7 w-7" />
                </div>

                <div className="w-full space-y-2">
                  <span className="text-halal-primary block text-[10px] font-black tracking-[0.4em] uppercase opacity-70">
                    {item.label}
                  </span>
                  <h3 className="text-2xl leading-tight font-bold text-white transition-colors duration-300 md:text-5xl">
                    {item.value}
                  </h3>
                  {'sub' in item && item.sub && (
                    <p className="min-h-[1.5em] text-sm font-semibold text-zinc-400 transition-colors group-hover:text-zinc-300 md:text-lg">
                      {item.sub}
                    </p>
                  )}

                  {'customContent' in item && item.customContent}
                </div>
              </div>

              {/* Mobile Image */}
              {item.image && (
                <div className="relative -mx-10 mt-8 -mb-10 h-[350px] overflow-hidden md:hidden">
                  <Image
                    src={item.image}
                    alt={item.value}
                    fill
                    className="object-cover object-top contrast-110"
                    style={{
                      maskImage:
                        'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
                      WebkitMaskImage:
                        'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a19] via-transparent to-transparent" />
                </div>
              )}
            </div>

            <div className="absolute right-0 bottom-0 left-0 h-[4px] overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="to-halal-primary h-full w-full bg-gradient-to-r from-amber-400" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
