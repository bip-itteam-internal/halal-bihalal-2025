'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Guest } from '@/types'

interface ParticipantCardProps {
  guest: Guest
  style: { width: string; height: string; fontSize: string }
  isEliminating: boolean
  isDangerMode: boolean
  isTop9: boolean
}

export function ParticipantCard({
  guest,
  style,
  isEliminating,
  isDangerMode,
  isTop9,
}: ParticipantCardProps) {
  return (
    <motion.div
      layout
      initial={{ scale: 0, rotateY: -180, opacity: 0 }}
      animate={{
        scale: 1,
        rotateY: 0,
        opacity: 1,
        backgroundColor: isEliminating
          ? 'rgba(239, 68, 68, 0.4)'
          : 'rgba(25, 25, 25, 0.6)',
        borderColor: isEliminating
          ? 'rgba(239, 68, 68, 1)'
          : isDangerMode
            ? 'rgba(239, 68, 68, 0.4)'
            : 'rgba(255, 255, 255, 0.1)',
        boxShadow: isEliminating
          ? '0 0 40px rgba(239, 68, 68, 0.6)'
          : isDangerMode
            ? '0 0 20px rgba(239, 68, 68, 0.2)'
            : '0 4px 15px rgba(0, 0, 0, 0.2)',
      }}
      exit={{
        scale: 0.5,
        rotateY: 180,
        opacity: 0,
        transition: { duration: 0.7, ease: [0.32, 0, 0.67, 0] },
      }}
      transition={{
        layout: {
          duration: 0.7,
          type: 'spring',
          stiffness: 180,
          damping: 28,
        },
        backgroundColor: { duration: 0.2 },
      }}
      style={{
        width: style.width,
        height: style.height,
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border text-center leading-none shadow-2xl backdrop-blur-xl',
        isTop9 && 'animate-pulse-border',
      )}
    >
      <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden p-2 lg:p-3">
        <h3
          className="w-full overflow-hidden font-bold text-white/90 uppercase"
          style={{ fontSize: style.fontSize }}
        >
          {guest.full_name}
        </h3>
      </div>
      {/* Premium reflective overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  )
}
