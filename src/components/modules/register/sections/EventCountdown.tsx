import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface EventCountdownProps {
  targetDate: Date
  eventName?: string
  onComplete?: () => void
  compact?: boolean
}

export function EventCountdown({ targetDate, eventName, onComplete, compact = false }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date()
      
      if (difference <= 0) {
        setIsFinished(true)
        onComplete?.()
        return null
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    const timer = setInterval(() => {
      const nextTime = calculateTimeLeft()
      setTimeLeft(nextTime)
      if (!nextTime) {
        clearInterval(timer)
      }
    }, 1000)

    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  if (isFinished || !timeLeft) return null

  if (compact) {
    return (
      <section className="relative z-20 py-4 md:py-6 bg-halal-secondary/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-halal-primary" />
              <p className="font-outfit text-xs font-bold tracking-widest text-halal-primary uppercase">
                {eventName || 'MENUJU ACARA'}
              </p>
            </div>
            
            <div className="flex items-center gap-4 md:gap-8">
              <CompactItem label="Hari" value={timeLeft.days} />
              <CompactItem label="Jam" value={timeLeft.hours} />
              <CompactItem label="Menit" value={timeLeft.minutes} />
              <CompactItem label="Detik" value={timeLeft.seconds} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative z-10 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-14 md:gap-20">
          <div className="text-center">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-halal-primary text-[10px] font-black tracking-[0.6em] uppercase md:text-xs"
            >
              {eventName || 'COUNTING DOWN TO'}
            </motion.p>
            <h3 className="font-outfit mt-4 text-4xl font-black tracking-tight text-slate-900 uppercase md:mt-6 md:text-7xl">
              MENUJU ACARA
            </h3>
          </div>

          <div className="grid w-full grid-cols-4 gap-3 sm:gap-6 md:gap-10">
            <CountdownItem label="Hari" value={timeLeft.days} />
            <CountdownItem label="Jam" value={timeLeft.hours} />
            <CountdownItem label="Menit" value={timeLeft.minutes} />
            <CountdownItem label="Detik" value={timeLeft.seconds} />
          </div>
        </div>
      </div>
    </section>
  )
}

function CompactItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-6 overflow-hidden md:h-8">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="font-outfit block min-w-[1.5rem] text-center text-sm font-black text-slate-900 md:text-lg"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        {label}
      </span>
    </div>
  )
}

function CountdownItem({ label, value }: { label: string; value: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative flex aspect-square w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] ring-1 ring-black/5 backdrop-blur-3xl md:aspect-auto md:h-48 md:w-48 md:rounded-[2.5rem]"
    >
      <div className="bg-halal-primary/5 absolute inset-0 rounded-2xl md:rounded-[2.5rem]" />
      <div className="relative h-12 overflow-hidden md:h-24">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="font-outfit block text-2xl font-black tracking-tighter text-slate-900 md:text-7xl"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="relative mt-1 text-[8px] font-bold tracking-widest text-slate-400 uppercase md:mt-2 md:text-xs">
        {label}
      </span>
    </motion.div>
  )
}
