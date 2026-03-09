'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import slugify from 'slugify'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Users, Store } from 'lucide-react'

const FloatingStars = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 15 + 10,
      color: Math.random() > 0.4 ? '#fbbf24' : '#ffffff',
    }))
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 15px ${p.color}`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -60, -20, 0],
            x: [0, 40, -40, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.2, 0.6, 0.3, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
      {/* Shooting Stars */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`shooting-${i}`}
          className="absolute h-[1px] w-[150px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
          initial={{
            opacity: 0,
            rotate: -35,
            x: '-20%',
            y: `${Math.random() * 70}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            x: ['0%', '150%'],
            y: ['0%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 15,
            repeatDelay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  )
}

export function Hero({
  eventId,
  logoUrl,
  title,
  onAction,
}: {
  eventId?: string
  logoUrl?: string
  title?: string
  onAction: (type: 'external' | 'tenant') => void
}) {
  return (
    <section className="bg-halal-secondary relative flex min-h-screen w-full items-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <FloatingStars />

        {/* Cinematic Overlays */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          {/* Main Cinematic Gradient Overlay */}
          <div className="from-halal-secondary via-halal-secondary/60 absolute inset-0 z-10 bg-gradient-to-b to-transparent" />

          {/* Golden Aura Glow Central */}
          <div className="bg-halal-primary/20 absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[100px] md:h-[800px] md:w-[800px] md:blur-[180px]" />
        </motion.div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-16 pb-20 md:pt-16 md:pb-24">
        <div className="flex flex-col items-center gap-8 text-center md:gap-10">
          {/* Top Brand/Logo Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex w-full flex-col items-center gap-4"
          >
            {logoUrl ? (
              <div className="relative drop-shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={180}
                  height={70}
                  className="h-32 w-auto object-contain md:h-40"
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
                  className="h-16 w-auto object-contain md:h-40"
                  priority
                />
              </div>
            )}
          </motion.div>

          {/* Headline and Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full space-y-8"
          >
            <div className="space-y-6">
              <h4 className="font-outfit mx-auto max-w-6xl text-4xl font-bold tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
                {title || 'HALAL BIHALAL'}
              </h4>
            </div>

            <div className="relative z-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
                {eventId ? (
                  <Link
                    href={`/register/${slugify(title || '', {
                      lower: true,
                      strict: true,
                    })}/tenant`}
                  >
                    <Button
                      variant="outline"
                      className="border-halal-primary/40 text-halal-primary hover:bg-halal-primary hover:text-halal-secondary flex w-full items-center justify-center gap-3 rounded-full bg-black/20 text-xs font-black tracking-[0.1em] uppercase backdrop-blur-xl transition-all sm:w-auto md:text-sm"
                      size="lg"
                    >
                      <Store className="h-5 w-5 md:h-6 md:w-6" />
                      Booth UMKM
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="border-halal-primary/40 text-halal-primary hover:bg-halal-primary hover:text-halal-secondary flex w-full items-center justify-center gap-3 rounded-full bg-black/20 text-xs font-black tracking-[0.1em] uppercase backdrop-blur-xl transition-all sm:w-auto md:text-sm"
                    onClick={() => onAction('tenant')}
                    size="lg"
                  >
                    <Store className="h-5 w-5 md:h-6 md:w-6" />
                    Booth UMKM
                  </Button>
                )}
              </motion.div>
            </div>

            {/* Poster Image Area */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pointer-events-none relative mx-auto mt-12 h-[320px] w-full max-w-5xl drop-shadow-2xl md:h-[400px]"
            >
              <Image
                src="/wali.png"
                alt="Wali Band"
                fill
                className="scale-125 object-contain object-bottom transition-transform duration-1000 hover:scale-135 md:scale-150 md:hover:scale-165"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
