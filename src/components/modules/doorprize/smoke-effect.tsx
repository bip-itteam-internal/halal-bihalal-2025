'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SmokeEffectProps {
  active: boolean
}

export function SmokeEffect({ active }: SmokeEffectProps) {
  // Create smoke emitters at various positions
  const emitters = useMemo(() => [
    { id: 1, x: '10%', y: '90%' },
    { id: 2, x: '30%', y: '95%' },
    { id: 3, x: '70%', y: '95%' },
    { id: 4, x: '90%', y: '90%' },
    { id: 5, x: '50%', y: '98%' },
  ], [])

  return (
    <div className="pointer-events-none absolute -inset-10 z-50 overflow-visible">
      <AnimatePresence>
        {active && emitters.map((emitter) => (
          <SmokeCloud key={emitter.id} x={emitter.x} y={emitter.y} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function SmokeCloud({ x, y }: { x: string, y: string }) {
  // Generate a continuous stream of smoke particles while active
  const particles = Array.from({ length: 12 }) // More particles for better effect

  return (
    <>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            scale: 0.3, 
            x: 0, 
            y: 0,
            filter: 'blur(20px)'
          }}
          animate={{ 
            opacity: [0, 0.6, 0.3, 0], 
            scale: [0.3, 2, 4, 6], 
            y: -100 - Math.random() * 400, // Float up higher
            x: (Math.random() - 0.5) * 200, // Wider spread
            transition: { 
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "linear"
            }
          }}
          className="absolute rounded-full bg-gradient-to-br from-gray-300 via-gray-500 to-transparent"
          style={{ 
            left: x, 
            top: y,
            width: '100px',
            height: '80px',
          }}
        />
      ))}
    </>
  )
}
