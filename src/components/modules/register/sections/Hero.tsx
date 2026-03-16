'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Particles, ShootingStars } from '@/components/ui/particles'

export function Hero({ logoUrl, title }: { logoUrl?: string; title?: string }) {
  return (
    <section className="bg-halal-secondary relative flex min-h-screen w-full items-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Particles count={40} />
        <ShootingStars />

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

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex w-full flex-col items-center space-y-8"
          >
            <div className="space-y-6">
              <h4 className="font-outfit mx-auto max-w-6xl text-4xl font-bold tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
                {title || 'HALAL BIHALAL'}
              </h4>
            </div>

            {/* Poster Image Area */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pointer-events-none relative mx-auto mt-12 h-[320px] w-full max-w-5xl drop-shadow-2xl md:h-[400px]"
            >
              <Image
                src="/CHARLY PNG.png"
                alt="Setia Band"
                fill
                className="scale-125 object-contain object-bottom transition-transform duration-1000 hover:scale-135 md:scale-150 md:hover:scale-165"
                style={{
                  maskImage:
                    'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
                }}
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
