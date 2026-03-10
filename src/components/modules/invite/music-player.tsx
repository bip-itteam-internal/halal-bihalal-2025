'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Music, Play, Pause } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MusicPlayerProps {
  url: string
  autoPlay?: boolean
}

export function FloatingMusicPlayer({
  url,
  autoPlay = false,
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (autoPlay) {
      const playAudio = () => {
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.log('Autoplay blocked or failed:', err)
              setIsPlaying(false)
            })
        }
      }

      playAudio()

      // Also try to play on any click if it hasn't started yet
      const handleGlobalClick = () => {
        if (!isPlaying) {
          playAudio()
          window.removeEventListener('click', handleGlobalClick)
        }
      }
      window.addEventListener('click', handleGlobalClick)
      return () => window.removeEventListener('click', handleGlobalClick)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [autoPlay])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <>
      <audio ref={audioRef} src={url} loop preload="auto" autoPlay={autoPlay} />
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-[#0a2c2f] shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-all hover:bg-amber-400"
        aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="playing"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Pause className="h-6 w-6 fill-current" />
            </motion.div>
          ) : (
            <motion.div
              key="paused"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Play className="ml-1 h-6 w-6 fill-current" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Music note icons floating up when playing */}
        {isPlaying && (
          <div className="pointer-events-none absolute inset-0">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ y: 0, x: 0, opacity: 1 }}
                animate={{
                  y: -40 - i * 20,
                  x: i % 2 === 0 ? 20 : -20,
                  opacity: 0,
                }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Music className="h-4 w-4 text-amber-600" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pulse effect when playing */}
        {isPlaying && (
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-amber-400"
          />
        )}
      </motion.button>
    </>
  )
}
