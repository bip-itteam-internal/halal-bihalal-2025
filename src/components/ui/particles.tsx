import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ParticlesProps {
  className?: string
  count?: number
  colors?: string[]
}

export const Particles = ({
  className,
  count = 40,
  colors = ['#dfae46', '#ffffff'],
}: ParticlesProps) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const particles = useMemo(() => {
    return Array.from({ length: isMobile ? Math.min(count, 20) : count }).map(
      (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * (isMobile ? 2 : 4) + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 15 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    )
  }, [count, colors, isMobile])

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-0 overflow-hidden',
        className
      )}
    >
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
            boxShadow: isMobile ? 'none' : `0 0 10px ${p.color}`,
            filter: isMobile ? 'none' : 'blur(1px)',
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
          }}
          animate={{
            y: isMobile ? [0, -40, 0] : [0, -50, -10, 0],
            x: isMobile ? 0 : [0, 30, -30, 0],
            opacity: [0.1, 0.4, 0.2, 0.1],
            scale: isMobile ? 1 : [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

export const ShootingStars = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {[...Array(count)].map((_, i) => (
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
