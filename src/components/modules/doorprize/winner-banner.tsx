'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { Guest } from '@/types'
import { Button } from '@/components/ui/button'

interface WinnerBannerProps {
  winner: Guest | null
  onReset: () => void
}

export function WinnerBanner({ winner, onReset }: WinnerBannerProps) {
  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-10 backdrop-blur-3xl"
        >
          {/* Gold Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.15)_0%,transparent_70%)]" />

          <div className="relative flex h-full w-full max-w-[1600px] flex-col items-center justify-center">
            {/* Spinning star bg */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
              className="absolute opacity-10"
            >
              <Star className="h-[1200px] w-[1200px] fill-amber-500" />
            </motion.div>

            <div className="relative z-10 space-y-12 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  damping: 10,
                  stiffness: 100,
                  delay: 0.2,
                }}
              ></motion.div>

              <div className="space-y-4">
                <p className="text-3xl font-black tracking-[1.2em] text-amber-500/80 uppercase">
                  CONGRATULATIONS
                </p>
                <div className="space-y-6">
                  <h1 className="bg-gradient-to-b from-white via-amber-200 to-amber-500 bg-clip-text text-[8vw] leading-[1] font-black tracking-tighter text-transparent drop-shadow-[0_0_120px_rgba(251,191,36,0.4)]">
                    {winner.full_name}
                  </h1>
                  {winner.address && (
                    <p className="text-2xl font-bold tracking-[0.5em] text-amber-200/60 uppercase">
                      {winner.address}
                    </p>
                  )}
                </div>
              </div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, type: 'spring' }}
                className="pt-20"
              >
                <Button
                  className="rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-16 py-8 text-xl font-black text-black shadow-[0_15px_40px_rgba(251,191,36,0.3)] transition-transform hover:scale-105 active:scale-95"
                  onClick={onReset}
                >
                  NEXT ROUND
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
