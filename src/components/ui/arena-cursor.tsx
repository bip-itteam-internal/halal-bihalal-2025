'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export function ArenaCursor() {
  const [enabled, setEnabled] = useState(false)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth out the movement for the outer glow ONLY
  const springConfig = { damping: 25, stiffness: 200 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  useEffect(() => {
    // Only enable if on desktop
    if (window.matchMedia('(pointer: fine)').matches) {
      setEnabled(true)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  if (!enabled) return null

  return (
    <>
      {/* Mega Glow following smoothly behind the arrow */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/15 blur-2xl"
        style={{
          x: smoothX,
          y: smoothY,
        }}
      />

      {/* Classic Mouse Pointer Arrow (Anak Panah) */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[10000]"
        style={{
          x: mouseX,
          y: mouseY,
        }}
      >
        <div className="relative">
             <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="filter drop-shadow-[0_0_12px_rgba(217,119,6,0.8)]"
            >
                {/* Classic Arrow Shape with Tail */}
                <path 
                    d="M5.5 3V19L9.5 15L12 21L14 20L11.5 14H17L5.5 3Z" 
                    fill="#f59e0b"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
      </motion.div>

      {/* Subtle Crosshair Guidance */}
      <motion.div 
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-px w-screen bg-amber-500/10"
        style={{ y: mouseY }}
      />
      <motion.div 
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-screen w-px bg-amber-500/10"
        style={{ x: mouseX }}
      />
    </>
  )
}
