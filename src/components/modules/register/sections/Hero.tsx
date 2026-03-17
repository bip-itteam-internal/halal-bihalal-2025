import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Particles, ShootingStars } from '@/components/ui/particles'

export function Hero({ logoUrl, title }: { logoUrl?: string; title?: string }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <section className="bg-halal-secondary relative flex min-h-screen w-full items-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Particles count={isMobile ? 15 : 40} />
        {!isMobile && <ShootingStars />}

        {/* Stage Lights / Concert Lighting */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Main Stage Blue Spotlights */}
          <motion.div
            animate={
              isMobile
                ? { opacity: [0.2, 0.4, 0.2] }
                : {
                    opacity: [0.3, 0.5, 0.3],
                    rotate: [-10, 10, -10],
                    x: ['-10%', '10%', '-10%'],
                  }
            }
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 left-1/4 -z-10 h-[500px] w-[250px] origin-top bg-cyan-500/10 blur-[60px] will-change-[opacity,transform] md:h-[1000px] md:w-[500px] md:bg-cyan-500/20 md:blur-[80px]"
            style={{
              borderRadius: '50% 50% 0 0',
              transform: isMobile
                ? 'rotate(-25deg) translateZ(0)'
                : 'rotate(-25deg)',
            }}
          />
          <motion.div
            animate={
              isMobile
                ? { opacity: [0.2, 0.4, 0.2] }
                : {
                    opacity: [0.3, 0.5, 0.3],
                    rotate: [10, -10, 10],
                    x: ['10%', '-10%', '10%'],
                  }
            }
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 right-1/4 -z-10 h-[500px] w-[250px] origin-top bg-purple-500/10 blur-[60px] will-change-[opacity,transform] md:h-[1000px] md:w-[500px] md:bg-purple-500/20 md:blur-[80px]"
            style={{
              borderRadius: '50% 50% 0 0',
              transform: isMobile
                ? 'rotate(25deg) translateZ(0)'
                : 'rotate(25deg)',
            }}
          />

          {/* Golden Floor Uplights */}
          <motion.div
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: isMobile ? 1 : [1, 1.2, 1],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="from-halal-primary/30 absolute right-0 bottom-0 left-0 h-64 bg-gradient-to-t to-transparent blur-[40px] will-change-[opacity] md:from-halal-primary/40 md:blur-[60px]"
            style={{ transform: 'translateZ(0)' }}
          />

          {/* Moving Laser Lights - Desktop Only for Performance */}
          {!isMobile && (
            <>
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                  opacity: [0, 0.5, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/3 left-0 h-[2px] w-full -rotate-12 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
              />
              <motion.div
                animate={{
                  x: ['200%', '-100%'],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 1,
                }}
                className="absolute top-1/2 left-0 h-[1px] w-full rotate-6 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"
              />
            </>
          )}

          {/* Bottom-up Light Beams - Simplified on Mobile */}
          <motion.div
            animate={{
              opacity: isMobile ? [0.1, 0.2, 0.1] : [0.1, 0.4, 0.1],
              scaleX: isMobile ? 1 : [1, 1.5, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-20 left-1/3 -z-10 h-[400px] w-1 rotate-[15deg] bg-cyan-400/20 blur-[30px] md:h-[800px] md:blur-[40px]"
            style={{ transform: 'translateZ(0)' }}
          />
          <motion.div
            animate={{
              opacity: isMobile ? [0.1, 0.2, 0.1] : [0.1, 0.4, 0.1],
              scaleX: isMobile ? 1 : [1, 1.5, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
            className="absolute right-1/3 -bottom-20 -z-10 h-[400px] w-1 rotate-[-15deg] bg-purple-400/20 blur-[30px] md:h-[800px] md:blur-[40px]"
            style={{ transform: 'translateZ(0)' }}
          />
        </div>

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
          <div className="bg-halal-primary/10 absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[80px] md:h-[800px] md:w-[800px] md:opacity-30 md:blur-[180px]" />
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

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex h-10 w-6 justify-center rounded-full border-2 border-white/30 p-1"
          >
            <motion.div
              animate={{
                y: [0, 12, 0],
                opacity: [1, 0, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="bg-halal-primary h-2 w-1 rounded-full shadow-[0_0_8px_#f59e0b]"
            />
          </motion.div>
          <span className="text-[10px] font-medium tracking-[0.2em] text-white/50 uppercase">
            Scroll
          </span>
        </div>
      </motion.div>
    </section>
  )
}
