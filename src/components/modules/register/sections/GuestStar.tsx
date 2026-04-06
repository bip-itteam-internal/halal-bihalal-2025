'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function GuestStar() {
  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
      {/* Background Decor - Consistency */}
      <div className="bg-halal-primary/5 absolute top-1/2 left-1/2 -z-10 h-[500px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]" />

      <div className="mb-16 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="border-slate-200 bg-white/40 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 shadow-sm ring-1 ring-black/5 backdrop-blur-2xl"
          >
            <div className="bg-halal-primary h-1.5 w-1.5 animate-pulse rounded-full" />
            <span className="text-halal-primary text-[10px] font-black tracking-[0.5em] uppercase">
              Special Moment
            </span>
          </motion.div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase md:text-5xl">
            PENAMPIL <span className="text-halal-primary">UTAMA</span>
          </h2>
          <div className="bg-halal-primary/30 mx-auto h-1 w-24 rounded-full blur-[1px]" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="border-slate-200/60 relative aspect-[16/9] w-full overflow-hidden rounded-[4rem] border bg-white/40 shadow-sm md:aspect-[21/9]"
      >
        <Image
          src="/wali.png"
          alt="Wali Band"
          fill
          className="object-contain grayscale transition-all duration-1000 hover:scale-105 hover:grayscale-0"
        />
        <div className="from-[#F6E8CD] absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-80" />

        <div className="absolute right-10 bottom-10 left-10 text-center md:bottom-16">
          <motion.h4
            className="text-6xl font-black tracking-tighter text-slate-900 uppercase md:text-9xl"
            style={{ WebkitTextStroke: '1px rgba(0,0,0,0.05)' }}
          >
            WALI BAND
          </motion.h4>
          <p className="text-halal-primary mt-4 font-serif text-2xl tracking-wide italic">
            &quot;Satu Hati, Satu Silaturahmi&quot;
          </p>
        </div>

        {/* Subtle Lighting Beams */}
        <div className="bg-halal-primary/10 absolute top-0 left-1/4 h-full w-px blur-sm" />
        <div className="bg-halal-primary/10 absolute top-0 right-1/4 h-full w-px blur-sm" />
      </motion.div>
    </section>
  )
}
