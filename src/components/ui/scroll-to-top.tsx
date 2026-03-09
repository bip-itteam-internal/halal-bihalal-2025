'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          className="text-halal-primary hover:border-halal-primary/40 hover:bg-halal-primary hover:text-halal-secondary fixed right-8 bottom-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#0a1b1a]/80 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(223,174,70,0.4)] md:right-12 md:bottom-12"
          aria-label="Scroll to top"
        >
          <div className="bg-halal-primary/10 absolute inset-0 animate-pulse rounded-full blur-xl" />
          <ChevronUp className="relative z-10 h-7 w-7" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
