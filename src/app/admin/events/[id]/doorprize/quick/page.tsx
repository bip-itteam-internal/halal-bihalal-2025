'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Trophy, ArrowLeft, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { useDoorprize } from '@/hooks/use-doorprize'
import { Particles, ShootingStars } from '@/components/ui/particles'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { audioManager } from '@/lib/audio-manager'
import { Guest } from '@/types'
import { SpinnerWheel } from '@/components/modules/doorprize/spinner-wheel'
import { WinnersListModal } from '@/components/modules/doorprize/winners-list-modal'
import { Trophy as TrophyIcon } from 'lucide-react'

export default function SpinnerWheelPage() {
  const { candidates, loading, setWinnerToDatabase } = useDoorprize()
  const [winners, setWinners] = useState<Guest[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [isWinnersListOpen, setIsWinnersListOpen] = useState(false)

  const handleWinner = useCallback((winner: Guest) => {
    // Save to database
    setWinnerToDatabase(winner)
    // Delay adding to winner list for dramatic effect
    setTimeout(() => {
      setWinners(prev => [winner, ...prev])
      audioManager.playVictory()
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dfae46', '#ffffff', '#102726']
      })
    }, 1000)
  }, [])

  const resetGame = () => {
    setWinners([])
    setIsSpinning(false)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050c0b] text-white selection:bg-halal-primary selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0">
        <Particles count={30} />
        <ShootingStars />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <Link href="/admin/doorprize">
          <Button variant="ghost" className="mb-8 text-slate-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Arena
          </Button>
        </Link>

        {/* Winner List Button - Top Right Floating */}
        <div className="absolute top-12 right-6">
          <Button 
            variant="outline"
            onClick={() => setIsWinnersListOpen(true)}
            className="h-12 px-6 rounded-xl border-white/5 bg-white/5 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 font-bold tracking-widest uppercase transition-all"
          >
            <TrophyIcon className="mr-2 h-5 w-5" />
            Winner List
          </Button>
        </div>

        <div className="mb-12 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
            <Target className="h-8 w-8" />
          </div>
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-outfit text-4xl font-black tracking-tight md:text-6xl uppercase"
          >
            Spinner <span className="text-sky-400">Wheel</span>
          </motion.h1>
          <p className="text-slate-400">
            Putar roda keberuntungan untuk menentukan pemenang doorprize.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Main Game Area - Full Width & Centered */}
          <div className="w-full flex justify-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-5xl"
            >
              <Card className="glass-dark border-white/5 bg-black/40 p-8 md:p-16 shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[850px] justify-between">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-30" />
                 
                 <div className="relative w-full flex flex-col items-center gap-12">
                    <AnimatePresence>
                      {isSpinning && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.2 }}
                          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                        >
                          <div className="bg-black/90 backdrop-blur-2xl px-16 py-8 rounded-full border border-sky-500/50 shadow-[0_0_150px_rgba(14,165,233,0.4)]">
                            <p className="text-4xl md:text-6xl font-black text-sky-400 tracking-[0.4em] animate-pulse drop-shadow-2xl">
                              SIAPAKAH DIA?
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!loading && candidates.length > 0 ? (
                      <SpinnerWheel 
                        candidates={candidates.filter(c => !winners.find(w => w.id === c.id))} 
                        onWinner={handleWinner}
                        isSpinning={isSpinning}
                        setIsSpinning={setIsSpinning}
                      />
                    ) : (
                      <div className="flex h-[600px] items-center justify-center text-slate-500 text-xl font-medium">
                        {loading ? 'Menyiapkan Kandidat...' : 'Tidak ada kandidat tersedia.'}
                      </div>
                    )}

                    <Button
                      size="lg"
                      onClick={() => setIsSpinning(true)}
                      disabled={isSpinning || candidates.length === 0}
                      className="bg-sky-500 text-black hover:bg-sky-400 h-28 px-24 rounded-full font-black text-4xl shadow-[0_0_80px_rgba(14,165,233,0.6)] transition-all active:scale-95 disabled:opacity-50 relative group overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-6">
                        {isSpinning ? (
                          <RefreshCcw className="h-12 w-12 animate-spin text-black/60" />
                        ) : (
                          <Target className="h-12 w-12" />
                        )}
                        PUTAR SEKARANG
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                 </div>
              </Card>
            </motion.div>
          </div>

          {/* Winners Section - Horizontal Scroll */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">Daftar Pemenang</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                    Total: <span className="text-sky-400">{winners.length}</span> • 
                    Tersisa: <span className="text-slate-300">{candidates.length - winners.length}</span>
                  </p>
                </div>
              </div>
              
              {winners.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetGame}
                  className="border-white/10 bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                >
                  Reset Game
                </Button>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-8 pt-2 px-4 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {winners.length === 0 ? (
                  <div className="w-full flex items-center justify-center h-48 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02] text-slate-600 font-medium">
                    Belum ada pemenang terpilih. Ayo tentukan keberuntungan mereka!
                  </div>
                ) : (
                  winners.map((winner, i) => (
                    <motion.div
                      key={winner.id}
                      initial={{ scale: 0.8, opacity: 0, x: -50 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      className="flex-shrink-0"
                    >
                      <Card className="w-[320px] glass-dark border-sky-500/30 bg-sky-500/5 p-6 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                          <Trophy className="h-12 w-12 text-sky-400 rotate-12" />
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-black font-black text-2xl shadow-lg">
                            {winners.length - i}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-xl text-white truncate leading-tight mb-1">{winner.full_name}</p>
                            <p className="text-[10px] text-sky-400/60 font-black uppercase tracking-widest truncate">
                              ID: {winner.id}
                            </p>
                            <div className="mt-2 text-[10px] text-slate-400 font-bold bg-white/5 px-2 py-1 rounded-md inline-block uppercase">
                              {winner.guest_type} • {winner.address || 'Internal'}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <WinnersListModal 
        isOpen={isWinnersListOpen}
        onClose={() => setIsWinnersListOpen(false)}
      />
    </div>
  )
}

