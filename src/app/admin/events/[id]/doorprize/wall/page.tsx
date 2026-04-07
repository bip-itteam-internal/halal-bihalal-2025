'use client'
import { use } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEnvelopeWall } from '@/hooks/use-envelope-wall'
import { EnvelopeCard } from '@/components/modules/doorprize/envelope-card'
import { WinnerBanner } from '@/components/modules/doorprize/winner-banner'
import { FloatingParticles } from '@/components/shared/floating-particles'
import { DoorprizeRulesModal } from '@/components/modules/doorprize/doorprize-rules-modal'
import { WinnersListModal } from '@/components/modules/doorprize/winners-list-modal'
import { cn } from '@/lib/utils'

export default function WallOfFortunePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: eventId } = use(params)
  const [isRulesOpen, setIsRulesOpen] = useState(true)
  const [isWinnersListOpen, setIsWinnersListOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'Bharata Group' | 'Sponsorship'>('Bharata Group')
  const {
    mapping,
    openedIds,
    loading,
    openEnvelope,
    lastWinner,
    reset,
    setLastWinner,
    candidates,
    selectedNumber,
    setSelectedNumber,
  } = useEnvelopeWall(eventId)

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden flex flex-col select-none">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(180,20,20,0.15)_0%,transparent_50%)]" />
      <FloatingParticles />

      {/* Floating Controls in Bottom Right - Ultra Compact */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-1.5 translate-y-[-10px]">
        {/* Compact Stats Indicator */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl shadow-2xl flex flex-col items-end">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">
            Envelopes
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-amber-500 leading-none">
              {candidates.length - openedIds.size}
            </span>
            <span className="text-[10px] font-bold text-white/20">/ {candidates.length}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          <Link href={`/admin/events/${eventId}/doorprize`}>
            <Button 
               variant="outline" 
               size="sm"
               className="h-9 w-9 p-0 bg-black/60 backdrop-blur-xl border-white/10 hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsWinnersListOpen(true)}
            className="h-9 w-9 p-0 bg-black/60 backdrop-blur-xl border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-xl group"
          >
            <Trophy className="h-4 w-4 transition-transform group-hover:scale-110" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={reset}
            className="h-9 px-3 bg-black/60 backdrop-blur-xl border-white/10 hover:bg-red-500/20 hover:text-red-400 font-bold rounded-xl text-[10px] uppercase tracking-wider"
          >
            <RotateCcw className="mr-1.5 h-3 w-3" />
            RESET
          </Button>
        </div>
      </div>


      {/* Main Grid Area */}
      <div className="relative z-10 flex-1 overflow-auto p-8 flex flex-wrap content-start justify-center gap-3 custom-scrollbar">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/20">
             <div className="h-12 w-12 border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
             <p className="font-bold tracking-[0.5em] uppercase">Preparing Wall...</p>
          </div>
        ) : (
          Array.from({ length: Object.keys(mapping).length }, (_, i) => i + 1).map((num) => {
            const guest = mapping[num]
            return (
              <EnvelopeCard
                key={num}
                number={num}
                guestName={guest?.full_name}
                isOpened={openedIds.has(guest?.id)}
                onClick={() => setSelectedNumber(num)}
              />
            )
          })
        )}
      </div>

      {/* Selection Overlay (The "Are you sure?" Zoom) */}
      <AnimatePresence>
        {selectedNumber !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -15, y: 100 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0, rotate: 15, y: 100 }}
              transition={{ type: 'spring', damping: 15 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="text-center space-y-2 mb-4">
                <p className="text-amber-500 font-black tracking-[0.5em] uppercase text-sm">You Selected</p>
                <h2 className="text-6xl font-black text-white">ENVELOPE #{selectedNumber}</h2>
              </div>

              {/* Enlarged Envelope View */}
              <div className="relative w-[300px] h-[220px] bg-gradient-to-br from-red-600 to-red-900 rounded-2xl border-4 border-amber-500 shadow-[0_0_50px_rgba(239,68,68,0.3)] flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-[100px] border-b-2 border-amber-500/30 bg-red-700/50" 
                     style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                <span className="text-8xl font-black text-amber-200 drop-shadow-2xl">{selectedNumber}</span>
                
                {/* Decorative Sparkles */}
                <div className="absolute -top-4 -right-4 animate-bounce">✨</div>
                <div className="absolute -bottom-4 -left-4 animate-bounce transition-delay-300">✨</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button 
                  size="lg"
                  onClick={() => openEnvelope(selectedNumber, selectedCategory)}
                  className="flex-1 h-16 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-xl rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  BUKA SEKARANG
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => setSelectedNumber(null)}
                  className="flex-1 h-16 border-white/20 bg-white/5 text-white font-bold text-lg rounded-2xl hover:bg-white/10"
                >
                  PILIH LAINNYA
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-4 text-center">
         <p className="text-[9px] font-bold text-white/10 uppercase tracking-[1em]">
            Select an envelope to reveal the lucky winner
         </p>
      </div>

      {/* Category Toggle (Bottom Left) */}
      <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-2">
        <p className="ml-2 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">
          RESULT CATEGORY
        </p>
        <div className="flex rounded-2xl border border-white/10 bg-black/60 p-1.5 backdrop-blur-xl">
          <button
            onClick={() => setSelectedCategory('Bharata Group')}
            className={cn(
              "relative px-6 py-2.5 text-xs font-black tracking-widest uppercase transition-all rounded-xl",
              selectedCategory === 'Bharata Group' 
                ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                : "text-white/40 hover:text-white/60"
            )}
          >
            BHARATA GROUP
          </button>
          <button
            onClick={() => setSelectedCategory('Sponsorship')}
            className={cn(
              "relative px-6 py-2.5 text-xs font-black tracking-widest uppercase transition-all rounded-xl",
              selectedCategory === 'Sponsorship' 
                ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]" 
                : "text-white/40 hover:text-white/60"
            )}
          >
            SPONSORSHIP
          </button>
        </div>
      </div>

      {/* Winner Display */}
      <WinnerBanner 
        winner={lastWinner} 
        onReset={() => setLastWinner(null)} 
      />

      <DoorprizeRulesModal
        gameTitle="Wall of Fortune"
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        rules={[
          "SELURUH TAMU YANG TERDAFTAR DI EVENT BERHAK IKUT DIUNDI.",
          "Pilih satu angka amplop yang tampil di layar utama.",
          "Satu amplop berisi satu identitas tamu yang beruntung.",
          "Pastikan peserta yang terpilih hadir di lokasi acara.",
          "Setelah dibuka, amplop akan tertanda 'Winner'."
        ]}
        controls={[
          { key: "Click", action: "Pilih Amplop" },
          { key: "Reset", action: "Muat Ulang Dinding" }
        ]}
      />

      <WinnersListModal 
        isOpen={isWinnersListOpen}
        onClose={() => setIsWinnersListOpen(false)}
        eventId={eventId}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}
