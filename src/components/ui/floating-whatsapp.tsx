'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingWhatsAppProps {
  phone: string
  message?: string
  containerClassName?: string
}

export function FloatingWhatsApp({
  phone,
  message = 'Halo Panitia, saya ingin bertanya tentang undangan ini.',
  containerClassName,
}: FloatingWhatsAppProps) {
  const [showTooltip, setShowTooltip] = React.useState(false)

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/${phone}?text=${encodedMessage}`
    window.open(url, '_blank')
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 z-[100] flex flex-col items-end gap-3 transition-all duration-500',
        containerClassName || 'right-6',
      )}
    >
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="rounded-2xl border border-white/10 bg-black/60 px-4 py-2 text-xs font-bold tracking-wide text-white uppercase shadow-2xl backdrop-blur-md"
          >
            Hubungi Panitia
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleWhatsAppClick}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-all hover:bg-[#20ba59] hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)]"
      >
        {/* Animated Glow Ring */}
        <span className="absolute inset-0 block rounded-full bg-[#25D366] opacity-30 group-hover:animate-ping" />

        <MessageCircle className="relative h-7 w-7 fill-current transition-transform duration-300 group-hover:rotate-12" />
      </motion.button>
    </div>
  )
}
