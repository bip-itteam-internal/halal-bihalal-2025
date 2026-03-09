'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Users, Store } from 'lucide-react'

export function Hero({
  logoUrl,
  title,
  onAction,
}: {
  logoUrl?: string
  title?: string
  onAction: (type: 'external' | 'tenant') => void
}) {
  return (
    <section className="bg-halal-secondary relative flex min-h-screen w-full items-center overflow-hidden">
      {/* Background Image - Desktop Only & Global Overlays */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        {/* Mobile Gradient Overlay */}
        <div className="from-halal-secondary via-halal-secondary/40 absolute inset-0 z-10 bg-gradient-to-b to-transparent md:hidden" />
        {/* Desktop Gradient Overlay */}
        <div className="from-halal-secondary via-halal-secondary/40 absolute inset-0 z-10 hidden bg-gradient-to-r to-transparent md:block" />

        {/* Desktop Only Background Image */}
        <div className="absolute inset-0 hidden md:block">
          <Image
            src="/wali.png"
            alt="Wali Band"
            fill
            className="translate-x-[20%] translate-y-10 scale-110 object-contain object-center"
            priority
          />
        </div>

        {/* Golden Aura Glow */}
        <div className="bg-halal-primary/20 absolute right-1/2 bottom-20 -z-10 h-[300px] w-[300px] translate-x-1/2 -translate-y-0 rounded-full opacity-30 blur-[100px] md:top-1/2 md:right-0 md:h-[600px] md:w-[600px] md:translate-x-[15%] md:-translate-y-1/2 md:blur-[180px]" />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-16 pb-20 md:pt-16 md:pb-24">
        <div className="flex flex-col items-center gap-8 text-center md:items-start md:gap-10 md:text-left">
          {/* Top Brand/Logo Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex w-full flex-col items-center gap-4 md:w-auto md:items-start"
          >
            {logoUrl ? (
              <div className="relative drop-shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={180}
                  height={70}
                  className="h-16 w-auto object-contain md:h-24"
                  priority
                />
              </div>
            ) : (
              <div className="relative drop-shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Image
                  src="/logo/LOGO A.png"
                  alt="Logo"
                  width={180}
                  height={70}
                  className="h-16 w-auto object-contain md:h-24"
                  priority
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="bg-halal-primary/40 hidden h-px w-12 md:block" />
              <span className="text-halal-primary font-serif text-sm tracking-[0.3em] uppercase italic md:text-xl md:tracking-[0.4em]">
                Halal Bihalal 1447H
              </span>
            </div>
          </motion.div>

          {/* Mobile Only Wali Image - Positioned between brand and heading */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative -mt-10 h-[300px] w-full md:hidden"
          >
            <Image
              src="/wali.png"
              alt="Wali Band"
              fill
              className="-translate-y-6 scale-120 object-contain object-bottom"
              priority
            />
          </motion.div>

          {/* Headline and Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full space-y-8 md:w-auto"
          >
            <div className="space-y-6">
              <h1 className="max-w-2xl text-3xl leading-[1.1] font-black tracking-tighter uppercase drop-shadow-2xl md:text-5xl lg:text-7xl">
                {title?.toUpperCase().includes('BHARATA GROUP') ? (
                  <>
                    <span className="block text-white">BHARATA GROUP</span>
                    <span className="from-halal-primary via-halal-primary block bg-gradient-to-b to-[#b88a2e] bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(223,174,70,0.5)]">
                      {title.toUpperCase().replace('BHARATA GROUP', '').trim()}
                    </span>
                  </>
                ) : (
                  <span className="from-halal-primary via-halal-primary bg-gradient-to-b to-[#b88a2e] bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(223,174,70,0.5)]">
                    {title || 'HALAL BIHALAL'}
                  </span>
                )}
              </h1>
              <p className="mx-auto max-w-sm text-sm font-medium tracking-wide text-slate-300 md:mx-0 md:max-w-md md:text-xl">
                Malam silaturahmi akbar dan perayaan kemenangan bersama grup
                musik kebanggaan keluarga Indonesia.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  className="bg-halal-primary text-halal-secondary hover:bg-halal-primary/90 flex w-full items-center justify-center gap-3 rounded-full text-xs font-black tracking-[0.1em] uppercase shadow-[0_25px_50px_rgba(223,174,70,0.3)] transition-all sm:w-auto md:text-sm"
                  onClick={() => onAction('external')}
                  size="lg"
                >
                  <Users className="h-5 w-5 md:h-6 md:w-6" />
                  Daftar Umum
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="border-halal-primary/40 text-halal-primary hover:bg-halal-primary hover:text-halal-secondary flex w-full items-center justify-center gap-3 rounded-full bg-black/20 text-xs font-black tracking-[0.1em] uppercase backdrop-blur-xl transition-all sm:w-auto md:text-sm"
                  onClick={() => onAction('tenant')}
                  size="lg"
                >
                  <Store className="h-5 w-5 md:h-6 md:w-6" />
                  Booth UMKM
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
