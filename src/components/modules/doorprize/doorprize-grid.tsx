'use client'

import { LayoutGroup, AnimatePresence } from 'framer-motion'
import { RefreshCcw } from 'lucide-react'
import { Guest } from '@/types'
import { ParticipantCard } from './participant-card'
import { getCardStyle } from './constants'

interface DoorprizeGridProps {
  aliveParticipants: Guest[]
  lastBatch: string[]
  isDangerMode: boolean
  loading: boolean
  hasCandidates: boolean
}

export function DoorprizeGrid({
  aliveParticipants,
  lastBatch,
  isDangerMode,
  loading,
  hasCandidates,
}: DoorprizeGridProps) {
  const style = getCardStyle(aliveParticipants.length)
  const isTop9 = aliveParticipants.length <= 9

  return (
    <div className="relative z-10 flex w-full flex-1 flex-wrap content-center items-center justify-center gap-1 overflow-hidden p-4 lg:gap-2">
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          {aliveParticipants.map((guest) => (
            <ParticipantCard
              key={guest.id}
              guest={guest}
              style={style}
              isEliminating={lastBatch.includes(guest.id)}
              isDangerMode={isDangerMode}
              isTop9={isTop9}
            />
          ))}
        </AnimatePresence>
      </LayoutGroup>

      {loading && !hasCandidates && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black/60 backdrop-blur-2xl">
          <RefreshCcw className="h-16 w-16 animate-spin text-white/20" />
          <p className="text-xl font-bold tracking-[1em] text-white/30 uppercase">
            Syncing
          </p>
        </div>
      )}
    </div>
  )
}
