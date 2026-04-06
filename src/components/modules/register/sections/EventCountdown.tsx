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
}

export function EventCountdown({ targetDate, eventName, onComplete }: EventCountdownProps) {
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

  return (
    <section className="relative z-10 py-24 md:py-32">
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

function CountdownItem({ label, value }: { label: string; value: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative flex aspect-square w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] ring-1 ring-black/5 backdrop-blur-3xl md:aspect-auto md:h-48 md:w-48 md:rounded-[2.5rem]"
    >
      <div className="bg-halal-primary/5 absolute inset-0 rounded-2xl md:rounded-[2.5rem]" />
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="font-outfit relative text-2xl font-black tracking-tighter text-slate-900 md:text-7xl"
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
      <span className="relative mt-1 text-[8px] font-bold tracking-widest text-slate-400 uppercase md:mt-2 md:text-xs">
        {label}
      </span>
    </motion.div>
  )
}
