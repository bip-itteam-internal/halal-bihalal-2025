'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface CountdownOverlayProps {
  count: number | null
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  return (
    <AnimatePresence>
      {count !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <motion.div
            key={count}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-[20vw] font-black text-amber-500 drop-shadow-[0_0_50px_rgba(245,158,11,0.5)]"
          >
            {count}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
