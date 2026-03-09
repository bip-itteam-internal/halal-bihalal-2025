'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function GuestStar() {
  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
      <div className="mb-16 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-2"
        >
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase md:text-5xl">
            PENAMPIL <span className="text-halal-primary">UTAMA</span>
          </h2>
          <div className="via-halal-primary mx-auto h-1 w-24 bg-gradient-to-r from-transparent to-transparent" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="border-halal-primary/20 relative aspect-[16/9] w-full overflow-hidden rounded-[4rem] border shadow-2xl md:aspect-[21/9]"
      >
        <Image
          src="/wali.webp"
          alt="Wali Band"
          fill
          className="object-contain transition-all duration-1000 hover:scale-105"
        />
        <div className="from-halal-secondary absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-60" />

        <div className="absolute right-10 bottom-10 left-10 text-center md:bottom-16">
          <motion.h4
            className="text-6xl font-black tracking-tighter text-white uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:text-9xl"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
          >
            WALI BAND
          </motion.h4>
          <p className="text-halal-primary mt-4 font-serif text-2xl tracking-wide italic">
            "Satu Hati, Satu Silaturahmi"
          </p>
        </div>

        {/* Lighting Effects */}
        <div className="via-halal-primary/20 absolute top-0 left-1/4 h-full w-px bg-gradient-to-b from-transparent to-transparent blur-sm" />
        <div className="via-halal-primary/20 absolute top-0 right-1/4 h-full w-px bg-gradient-to-b from-transparent to-transparent blur-sm" />
      </motion.div>
    </section>
  )
}
