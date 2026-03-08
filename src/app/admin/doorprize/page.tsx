'use client'

import { useDoorprize } from '@/hooks/use-doorprize'
import { DoorprizeHeader } from '@/components/modules/doorprize/doorprize-header'
import { DoorprizeGrid } from '@/components/modules/doorprize/doorprize-grid'
import { WinnerBanner } from '@/components/modules/doorprize/winner-banner'
import { FloatingParticles } from '@/components/shared/floating-particles'
import { CountdownOverlay } from '@/components/modules/doorprize/countdown-overlay'
import { cn } from '@/lib/utils'

export default function DoorprizePage() {
  const {
    candidates,
    aliveIds,
    loading,
    isEliminating,
    isAutoRunning,
    countdown,
    toggleAutoRun,
    lastBatch,
    aliveParticipants,
    winner,
    reset,
    forceRefresh,
  } = useDoorprize()

  const isDangerMode = aliveIds.size <= 10 && aliveParticipants.length > 1

  return (
    <div
      className={cn(
        'relative flex h-screen w-screen flex-col overflow-hidden text-white transition-colors duration-1000 select-none',
        isDangerMode ? 'bg-rose-950' : 'bg-[#0a0a0a]',
      )}
    >
      <style jsx global>{`
        @keyframes pulse-red {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px) rotate(-0.5deg);
          }
          75% {
            transform: translateX(5px) rotate(0.5deg);
          }
        }
        .animate-pulse-red {
          animation: pulse-red 2s infinite ease-in-out;
        }
        .animate-shake {
          animation: shake 0.1s infinite;
        }
        @keyframes pulse-border {
          0%,
          100% {
            border-color: rgba(239, 68, 68, 0.5);
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
          }
          50% {
            border-color: rgba(239, 68, 68, 1);
            box-shadow: 0 0 25px rgba(239, 68, 68, 0.5);
          }
        }
        .animate-pulse-border {
          animation: pulse-border 1.5s infinite ease-in-out;
        }
      `}</style>

      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-1000',
          isDangerMode
            ? 'animate-pulse-red bg-[radial-gradient(circle_at_50%_50%,rgba(150,0,0,0.2)_0%,rgba(0,0,0,1)_100%)]'
            : 'bg-[radial-gradient(circle_at_50%_50%,rgba(15,15,15,1)_0%,rgba(0,0,0,1)_100%)]',
        )}
      />

      <FloatingParticles />

      <DoorprizeHeader
        aliveCount={aliveIds.size}
        totalCount={candidates.length}
        isAutoRunning={isAutoRunning || countdown !== null}
        isEliminating={isEliminating}
        loading={loading}
        hasCandidates={candidates.length > 0}
        hasWinner={!!winner}
        onReset={reset}
        onToggleAutoRun={toggleAutoRun}
        onForceRefresh={forceRefresh}
      />

      <CountdownOverlay count={countdown} />

      <DoorprizeGrid
        aliveParticipants={aliveParticipants}
        lastBatch={lastBatch}
        isDangerMode={isDangerMode}
        loading={loading}
        hasCandidates={candidates.length > 0}
      />

      <WinnerBanner winner={winner} onReset={reset} />
    </div>
  )
}
