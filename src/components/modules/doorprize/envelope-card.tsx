'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MailOpen } from 'lucide-react'

interface EnvelopeCardProps {
  number: number
  guestName?: string
  isOpened: boolean
  onClick: () => void
}

export function EnvelopeCard({ number, guestName, isOpened, onClick }: EnvelopeCardProps) {
  return (
    <motion.div
      whileHover={!isOpened ? { scale: 1.05, y: -5 } : {}}
      whileTap={!isOpened ? { scale: 0.95 } : {}}
      onClick={!isOpened ? onClick : undefined}
      className={cn(
        "relative cursor-pointer group select-none",
        isOpened ? "cursor-default" : "cursor-pointer"
      )}
      style={{ width: '80px', height: '60px' }}
    >
      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="closed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
            className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-lg border-2 border-amber-500/50 shadow-lg flex items-center justify-center overflow-hidden"
          >
            {/* Envelope Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            
            {/* Flap Design */}
            <div className="absolute top-0 left-0 w-full h-[30px] border-b border-amber-500/30 bg-red-700/50" 
                 style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            
            <span className="relative z-10 text-xl font-black text-amber-200 drop-shadow-md">
              {number}
            </span>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </motion.div>
        ) : (
          <motion.div
            key="opened"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full h-full bg-amber-50 rounded-lg border-2 border-amber-200 shadow-inner flex flex-col items-center justify-center p-1 text-center"
          >
            <div className="text-[10px] font-bold text-red-800/40 uppercase leading-none mb-1">Winner</div>
            <div className="text-[9px] font-black text-red-900 uppercase break-words px-1 line-clamp-2 leading-tight">
              {guestName || '...'}
            </div>
            <MailOpen className="absolute bottom-1 right-1 h-3 w-3 text-amber-500/20" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
