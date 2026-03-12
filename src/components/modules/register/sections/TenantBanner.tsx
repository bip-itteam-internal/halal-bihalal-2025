'use client'

import React from 'react'
import Link from 'next/link'
import slugify from 'slugify'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TenantBannerProps {
  eventName: string
}

export function TenantBanner({ eventName }: TenantBannerProps) {
  const tenantLink = `/register/${slugify(eventName || '', {
    lower: true,
    strict: true,
  })}/tenant`

  return (
    <section className="relative z-10 py-16">
      {/* Background Decor */}
      <div className="bg-halal-primary/5 absolute inset-0 -z-10 bg-[url('https://www.transparenttextures.com/patterns/islamic-exercise.png')] opacity-10" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="from-halal-primary/20 relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br to-[#0a1b1a] p-8 md:p-14"
        >
          {/* Decorative Glow */}
          <div className="bg-halal-primary/10 absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[80px]" />
          <div className="bg-halal-primary/5 absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-[80px]" />

          <div className="relative flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-outfit text-3xl font-black text-white uppercase md:text-5xl">
                Registrasi{' '}
                <span className="text-halal-primary">Booth UMKM</span>
              </h3>
              <p className="max-w-md text-sm font-bold tracking-[0.2em] text-zinc-400 uppercase opacity-70">
                Khusus Food & Beverage (F&B)
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link href={tenantLink}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-halal-primary group h-auto rounded-2xl px-8 py-5 text-black transition-all hover:bg-white"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold uppercase">
                          Daftar Sekarang
                        </span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
