'use client'

import { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { audioManager } from '@/lib/audio-manager'
import { cn } from '@/lib/utils'

interface SlotReelProps {
  options: string[]
  targetIndex: number | null
  isSpinning: boolean
  delay: number
  isSlowMo?: boolean
  onStop?: () => void
}

export function SlotReel({ options, targetIndex, isSpinning, delay, isSlowMo, onStop }: SlotReelProps) {
  const controls = useAnimation()
  const [displayOptions, setDisplayOptions] = useState<string[]>([])
  const itemHeight = 180 // Increased from 120
  
  // Create a long list for the illusion of continuous spinning
  useEffect(() => {
    if (options.length > 0) {
      // Repeat options to ensure we have enough for a long spin
      const repeated = [...options, ...options, ...options, ...options, ...options]
      setDisplayOptions(repeated)
    }
  }, [options])

  useEffect(() => {
    if (isSpinning) {
      startSpin()
    } else if (targetIndex !== null) {
      stopSpin(targetIndex)
    }
  }, [isSpinning, targetIndex])

  const startSpin = async () => {
    // Endless loop animation
    controls.set({ y: 0 })
    await controls.start({
      y: -(options.length * itemHeight),
      transition: {
        duration: 0.5,
        ease: "linear",
        repeat: Infinity
      }
    })
  }

  const stopSpin = async (target: number) => {
    // Calculate final position
    // We want to stop at the 3rd repeat of the options to ensure we have content above/below
    const finalY = -( (2 * options.length + target) * itemHeight )
    
    // Smooth decelerate to the target with "Heavy Friction" feel
    const stopDuration = isSlowMo ? 5 : 2 + delay
    const easeCurve = isSlowMo 
      ? [0.08, 0.82, 0.17, 1] // Extreme Slow-Mo / Heavy Friction easing
      : [0.45, 0.05, 0.55, 0.95] // Standard smooth stop
      
    await controls.start({
      y: finalY,
      transition: {
        duration: stopDuration,
        ease: easeCurve as [number, number, number, number]
      }
    })

    audioManager.playSlotStop()
    onStop?.()
    
    // Subtle bounce
    await controls.start({
      y: finalY + 10,
      transition: { duration: 0.1 }
    })
    await controls.start({
      y: finalY,
      transition: { duration: 0.1 }
    })
  }

  return (
    <div className="relative h-[180px] w-full overflow-hidden bg-black/40 backdrop-blur-md border-y-4 border-amber-500/30 rounded-xl shadow-inner group">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-black via-transparent to-black opacity-80" />
      <div className="absolute inset-x-0 top-0 h-px z-30 bg-white/10" />
      <div className="absolute inset-x-0 bottom-0 h-px z-30 bg-white/10" />

      {/* Center Highlight Line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 bg-amber-500/20 z-10" />

      <motion.div
        animate={controls}
        className="flex flex-col items-center w-full"
      >
        {displayOptions.map((name, i) => {
          // Dynamic font size based on length (Bigger for the larger machine)
          const fontSize = name.length > 25 ? 'text-xl' 
                         : name.length > 15 ? 'text-2xl md:text-3xl'
                         : name.length > 10 ? 'text-3xl md:text-5xl'
                         : 'text-4xl md:text-6xl'
                         
          return (
            <div
              key={i}
              className={cn(
                "flex items-center justify-center font-black uppercase tracking-tighter text-center px-6 w-full",
                fontSize
              )}
              style={{ height: `${itemHeight}px` }}
            >
              <span className="bg-gradient-to-b from-white via-amber-100 to-amber-500 bg-clip-text text-transparent drop-shadow-lg break-words line-clamp-3 max-w-full leading-[1.1]">
                {name}
              </span>
            </div>
          )
        })}
      </motion.div>

      {/* Side Decorative Lights */}
      <div className="absolute inset-y-0 left-2 flex flex-col justify-around py-4 z-30">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        ))}
      </div>
      <div className="absolute inset-y-0 right-2 flex flex-col justify-around py-4 z-30">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
        ))}
      </div>
    </div>
  )
}
