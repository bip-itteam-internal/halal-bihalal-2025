'use client'

import { useEffect } from 'react'
import { ArrowLeft, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useDoorprize } from '@/hooks/use-doorprize'
import { DoorprizeGrid } from '@/components/modules/doorprize/doorprize-grid'
import { WinnerBanner } from '@/components/modules/doorprize/winner-banner'
import { FloatingParticles } from '@/components/shared/floating-particles'
import { CountdownOverlay } from '@/components/modules/doorprize/countdown-overlay'
import { DoorprizeRulesModal } from '@/components/modules/doorprize/doorprize-rules-modal'
import { WinnersListModal } from '@/components/modules/doorprize/winners-list-modal'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Trophy } from 'lucide-react'

export default function SurvivorDoorprizePage() {
  const [isRulesOpen, setIsRulesOpen] = useState(true)
  const [isWinnersListOpen, setIsWinnersListOpen] = useState(false)
  const {
    candidates,
    aliveIds,
    loading,
    isAutoRunning,
    countdown,
    toggleAutoRun,
    lastBatch,
    aliveParticipants,
    winner,
    reset,
  } = useDoorprize()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return
      
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        if (!loading && candidates.length > 0 && !winner) {
          toggleAutoRun()
        }
      } else if (e.key.toLowerCase() === 'r') {
        if (aliveIds.size < candidates.length) {
          reset()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, candidates.length, winner, toggleAutoRun, aliveIds.size, reset])

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

      {/* Floating Controls in Bottom Right - Ultra Compact */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-1.5 translate-y-[-10px]">
        {/* Ultra Compact Stats Indicator */}
        <div className="bg-black/80 backdrop-blur-xl border border-white/5 px-2 py-1 rounded-lg flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-500 shadow-2xl">
           <div className="flex items-center gap-1.5">
             <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
             SURVIVORS: <span className="text-white font-black">{aliveIds.size} / {candidates.length}</span>
           </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Arena Button - Ultra Compact */}
          <Link href="/admin/doorprize">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-lg bg-black/40 border-white/5 hover:bg-white/10 text-slate-400 font-bold transition-all text-[10px] flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3 w-3" />
              ARENA
            </Button>
          </Link>

          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsWinnersListOpen(true)}
            className="h-9 w-9 p-0 bg-black/40 border-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 group rounded-lg"
          >
            <Trophy className="h-4 w-4 transition-transform group-hover:scale-110" />
          </Button>

          {/* Reset Button - Ultra Compact */}
          {aliveIds.size < candidates.length && (
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="h-9 px-3 rounded-lg bg-black/40 border-white/5 hover:bg-red-500/10 hover:text-red-400 font-bold transition-all text-[10px]"
            >
              RESET
            </Button>
          )}

          {/* Main Action Button - Ultra Compact */}
          <Button
            size="sm"
            disabled={loading || candidates.length === 0 || !!winner}
            onClick={toggleAutoRun}
            className={cn(
               "h-9 px-4 rounded-lg font-bold text-[10px] transition-all shadow-xl",
               isAutoRunning || countdown !== null 
                ? "bg-amber-500 text-black hover:bg-amber-400" 
                : "bg-sky-500 text-black hover:bg-sky-400"
            )}
          >
            {isAutoRunning || countdown !== null ? (
              <span className="flex items-center gap-1.5">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                STOP
              </span>
            ) : (
              <span className="flex items-center gap-1.5 uppercase">
                Mulai Eliminasi
              </span>
            )}
          </Button>
        </div>
      </div>

      <CountdownOverlay count={countdown} />

      <div className="flex-1 overflow-hidden">
        <DoorprizeGrid
          aliveParticipants={aliveParticipants}
          lastBatch={lastBatch}
          isDangerMode={isDangerMode}
          loading={loading}
          hasCandidates={candidates.length > 0}
        />
      </div>

      <WinnerBanner winner={winner} onReset={reset} />

      <DoorprizeRulesModal
        gameTitle="Survivor Elimination"
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        rules={[
          "HANYA PESERTA YANG SUDAH CHECK-IN YANG BERHAK IKUT DIUNDI.",
          "Peserta dieliminasi secara bertahap dalam beberapa kloter.",
          "Peserta yang masih 'Alive' (berwarna putih) berhak lanjut.",
          "Pemenang adalah 1 orang terakhir yang tersisa di layar.",
          "Musik akan berubah lebih tegang saat sisa 10 orang terakhir."
        ]}
        controls={[
          { key: "Space / Enter", action: "Mulai Eliminasi" },
          { key: "R", action: "Reset Peserta" },
          { key: "Stop", action: "Berhenti Darurat" }
        ]}
      />

      <WinnersListModal 
        isOpen={isWinnersListOpen}
        onClose={() => setIsWinnersListOpen(false)}
      />
    </div>
  )
}
