'use client'
import { use } from 'react'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, Zap, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDoorprize } from '@/hooks/use-doorprize'
import { SlotReel } from '@/components/modules/doorprize/slot-reel'
import confetti from 'canvas-confetti'
import { FloatingParticles } from '@/components/shared/floating-particles'
import { audioManager } from '@/lib/audio-manager'
import { DoorprizeRulesModal } from '@/components/modules/doorprize/doorprize-rules-modal'
import { WinnersListModal } from '@/components/modules/doorprize/winners-list-modal'
import { cn } from '@/lib/utils'
import { Guest } from '@/types'

export default function SlotMachinePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: eventId } = use(params)
  const [isRulesOpen, setIsRulesOpen] = useState(true)
  const [isWinnersListOpen, setIsWinnersListOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<
    'Bharata Group' | 'Sponsorship'
  >('Bharata Group')
  const { candidates, aliveParticipants, reset, setWinnerToDatabase } =
    useDoorprize(eventId)

  const [spinPhase, setSpinPhase] = useState<
    'idle' | 'spinning_1' | 'fake_stop' | 'spinning_2'
  >('idle')
  const [reelTargets, setReelTargets] = useState<
    [number | null, number | null, number | null]
  >([0, 0, 0])
  const [reelStatus, setReelStatus] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ])
  const [localWinner, setLocalWinner] = useState<Guest | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const [hasCelebrated, setHasCelebrated] = useState(false)
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [totalPlannedFails, setTotalPlannedFails] = useState(0)

  const isSpinning = spinPhase === 'spinning_1' || spinPhase === 'spinning_2'

  // Prepare 3 different sets of data for the reels
  const locationOptions = useMemo(
    () => [
      'Bharata Group',
      ...Array.from(
        new Set(candidates.map((c) => (c.address || 'Hadirin').trim())),
      ),
    ],
    [candidates],
  )
  const initialOptions = useMemo(
    () => [
      'Bharata Group',
      ...Array.from(
        new Set(
          candidates
            .filter((c) => c.full_name && c.full_name.trim().length > 0)
            .map((c) => c.full_name.trim()[0].toUpperCase()),
        ),
      ).sort(),
    ],
    [candidates],
  )
  const nameOptions = useMemo(
    () => ['Bharata Group', ...candidates.map((c) => c.full_name || 'Anonim')],
    [candidates],
  )

  const startJackpot = () => {
    if (spinPhase !== 'idle' || aliveParticipants.length === 0) return

    const trueWinner =
      aliveParticipants[Math.floor(Math.random() * aliveParticipants.length)]
    const plannedFails = 2 // Always 2 glitches as requested

    setLocalWinner(trueWinner)
    setTotalPlannedFails(plannedFails)
    setCurrentAttempt(0)
    setHasCelebrated(false)

    runSpinStep(0, plannedFails, trueWinner)
  }

  const runSpinStep = (attempt: number, fails: number, winner: Guest) => {
    const isFinal = attempt >= fails

    // Determine what to show in this step
    let targetLocIdx: number
    let targetInitIdx: number
    let targetNameIdx: number

    if (isFinal) {
      const safeLoc = (winner.address || 'Hadirin').trim()
      const safeName = (winner.full_name || 'Anonim').trim()
      const safeInit = (safeName[0] || '?').toUpperCase()

      targetLocIdx = locationOptions.indexOf(safeLoc)
      targetInitIdx = initialOptions.indexOf(safeInit)
      targetNameIdx = nameOptions.indexOf(winner.full_name)

      // Fallback if not found
      if (targetLocIdx === -1) targetLocIdx = 0
      if (targetInitIdx === -1) targetInitIdx = 0
      if (targetNameIdx === -1) targetNameIdx = 0

      setSpinPhase('spinning_2')
    } else {
      // Pick random fake data
      targetLocIdx = Math.floor(Math.random() * locationOptions.length)
      targetInitIdx = Math.floor(Math.random() * initialOptions.length)
      targetNameIdx = Math.floor(Math.random() * nameOptions.length)

      // Ensure the initial is WRONG for the final winner initials for extra drama
      const trueInit = winner.full_name[0].toUpperCase()
      if (initialOptions[targetInitIdx] === trueInit) {
        targetInitIdx = (targetInitIdx + 1) % initialOptions.length
      }
      setSpinPhase('spinning_1')
    }

    setReelTargets([targetLocIdx, targetInitIdx, targetNameIdx])
    setReelStatus([true, true, true])
    setIsShaking(true)

    // Staggered stop for the reels
    setTimeout(() => {
      setReelStatus([false, true, true])
      audioManager.playSlotStop()

      setTimeout(() => {
        setReelStatus([false, false, true])
        audioManager.playSlotStop()

        setTimeout(() => {
          setReelStatus([false, false, false])
          // WE STOP HERE and wait for the actual SlotReel to trigger onStop
        }, 800)
      }, 800)
    }, 1200)
  }

  const handleFinalReelStop = () => {
    const isFinal = currentAttempt >= totalPlannedFails
    setIsShaking(false)
    audioManager.playSlotStop()

    if (!isFinal) {
      // It was a fake stop! Wait a bit, then glitch.
      setSpinPhase('fake_stop')
      audioManager.playError()

      setTimeout(() => {
        audioManager.playGlitch()
        setIsShaking(true)
        setTimeout(() => {
          const nextAttempt = currentAttempt + 1
          setCurrentAttempt(nextAttempt)
          if (localWinner) {
            runSpinStep(nextAttempt, totalPlannedFails, localWinner)
          }
        }, 400)
      }, 1000)
    } else {
      // THE REAL DEAL
      if (localWinner) {
        setWinnerToDatabase(localWinner, selectedCategory)
      }
      setSpinPhase('idle')
    }
  }

  const handleReset = () => {
    reset()
    setLocalWinner(null)
    setReelTargets([0, 0, 0])
    setIsShaking(false)
    setSpinPhase('idle')
    setHasCelebrated(false)
  }

  useEffect(() => {
    if (spinPhase === 'idle' && localWinner && !hasCelebrated) {
      setHasCelebrated(true)
      setTimeout(() => {
        audioManager.playVictory()

        // Side Cannons Celebration (10 Second Celebration)
        const duration = 10 * 1000
        const animationEnd = Date.now() + duration
        const defaults = {
          startVelocity: 60,
          spread: 80,
          ticks: 200,
          zIndex: 100,
          gravity: 0.8,
          scalar: 1.2,
          colors: ['#FFD700', '#F59E0B', '#D97706', '#FFFFFF', '#FFFBEB'],
        }

        const interval = setInterval(function () {
          const timeLeft = animationEnd - Date.now()

          if (timeLeft <= 0) {
            return clearInterval(interval)
          }

          const particleCount = 40

          // Firing from bottom-left corner
          confetti({
            ...defaults,
            particleCount,
            angle: 60,
            origin: { x: -0.1, y: 0.8 },
          })
          // Firing from bottom-right corner
          confetti({
            ...defaults,
            particleCount,
            angle: 120,
            origin: { x: 1.1, y: 0.8 },
          })
        }, 250)

        // Initial big bursts
        confetti({
          ...defaults,
          particleCount: 150,
          angle: 60,
          spread: 100,
          origin: { x: 0, y: 1 },
        })
        confetti({
          ...defaults,
          particleCount: 150,
          angle: 120,
          spread: 100,
          origin: { x: 1, y: 1 },
        })
      }, 300)
    }
  }, [spinPhase, localWinner, hasCelebrated])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#080808] p-4 text-white">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(180,20,20,0.1)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
      <FloatingParticles />

      {/* Floating Controls */}
      <div className="fixed right-8 bottom-8 z-50 flex flex-col items-end gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/80 p-4 shadow-2xl backdrop-blur-xl">
          <p className="mb-1 text-[10px] font-black tracking-widest text-amber-500 uppercase">
            Participants
          </p>
          <p className="text-2xl font-black text-white">
            {aliveParticipants.length}{' '}
            <span className="text-sm text-white/30">LUCKY SOULS</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {spinPhase === 'idle' && (
              <motion.div
                key="pull-lever-mini"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Button
                  onClick={startJackpot}
                  disabled={aliveParticipants.length === 0}
                  className={cn(
                    'h-12 rounded-xl px-8 font-black tracking-widest uppercase transition-all',
                    'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg hover:scale-105 active:scale-95',
                  )}
                >
                  <Zap className="mr-2 h-4 w-4 fill-white" />
                  PULL LEVER
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Link href={`/admin/events/${eventId}/doorprize`}>
            <Button
              variant="outline"
              className="h-12 w-12 rounded-xl border-white/10 bg-white/5 p-0"
            >
              <ArrowLeft />
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setIsWinnersListOpen(true)}
            className="group h-12 w-12 rounded-xl border-white/10 bg-white/5 p-0 hover:bg-emerald-500/20 hover:text-emerald-400"
          >
            <Trophy className="h-5 w-5 transition-transform group-hover:scale-110" />
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="group h-12 rounded-xl border-white/10 bg-white/5 px-6 font-bold hover:bg-red-500/20 hover:text-red-400"
          >
            <RotateCcw className="mr-2 h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            RESET
          </Button>
        </div>
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
              'relative rounded-xl px-6 py-2.5 text-xs font-black tracking-widest uppercase transition-all',
              selectedCategory === 'Bharata Group'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                : 'text-white/40 hover:text-white/60',
            )}
          >
            BHARATA GROUP
          </button>
          <button
            onClick={() => setSelectedCategory('Sponsorship')}
            className={cn(
              'relative rounded-xl px-6 py-2.5 text-xs font-black tracking-widest uppercase transition-all',
              selectedCategory === 'Sponsorship'
                ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]'
                : 'text-white/40 hover:text-white/60',
            )}
          >
            SPONSORSHIP
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 mb-16 text-center">
        <h1 className="bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 bg-clip-text text-8xl font-black tracking-tighter text-transparent uppercase italic drop-shadow-[0_0_30px_rgba(245,158,11,0.3)] md:text-[10rem]">
          JACKPOT <span className="text-white drop-shadow-none">ARENA</span>
        </h1>
        <p className="mt-4 text-xl font-black tracking-[0.5em] text-amber-500/60 uppercase">
          Spin for the ultimate glory
        </p>
      </div>

      {/* The Machine Body */}
      <motion.div
        animate={
          isShaking
            ? {
                x: [-2, 2, -2, 2, 0],
                y: [1, -1, 1, -1, 0],
                transition: { repeat: Infinity, duration: 0.1 },
              }
            : { x: 0, y: 0 }
        }
        className={cn(
          'relative z-10 w-full max-w-7xl rounded-[50px] border-[12px] p-6 shadow-[0_0_150px_rgba(0,0,0,1),inset_0_0_80px_rgba(255,255,255,0.05)] transition-colors duration-500 md:p-12',
          isSpinning || spinPhase === 'fake_stop'
            ? 'border-red-600 bg-[#150505] shadow-[0_0_100px_rgba(220,38,38,0.2)]'
            : 'border-[#333] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]',
        )}
      >
        {/* Marquee "Running" Lights (Exactly on the line) */}
        <div className="pointer-events-none absolute -inset-[6px] z-20 rounded-[50px]">
          {[...Array(44)].map((_, i) => (
            <motion.div
              key={`${i}-${spinPhase === 'fake_stop'}`}
              style={{
                position: 'absolute',
                offsetPath: 'border-box',
                offsetDistance: `${(i / 44) * 100}%`,
                offsetAnchor: 'center',
              }}
              animate={{
                opacity:
                  isSpinning || spinPhase === 'fake_stop' ? [0.1, 1, 0.1] : 0.2,
                scale:
                  isSpinning || spinPhase === 'fake_stop' ? [1, 1.5, 1] : 1,
              }}
              transition={{
                duration: spinPhase === 'fake_stop' ? 0.4 : 2,
                repeat: Infinity,
                delay: spinPhase === 'fake_stop' ? 0 : i * (2 / 44),
                ease: 'easeInOut',
              }}
              className={cn(
                'h-4 w-4 rounded-full',
                spinPhase === 'fake_stop'
                  ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                  : isSpinning
                    ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                    : 'bg-amber-600/20',
              )}
            />
          ))}
        </div>
        {/* Gold Bezel / Suspense Pulse */}
        <div
          className={cn(
            'pointer-events-none absolute -inset-3 rounded-[56px] border-[6px] transition-all duration-500',
            isSpinning || spinPhase === 'fake_stop'
              ? 'animate-pulse border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]'
              : 'border-amber-500/20',
          )}
        />

        <div className="grid grid-cols-1 gap-6 rounded-[40px] border-8 border-[#111] bg-black/60 p-6 md:grid-cols-3 md:gap-10 md:p-10">
          <div className="flex flex-col gap-2">
            <span className="text-center text-[10px] font-black tracking-[0.3em] text-amber-500/40 uppercase">
              Location
            </span>
            <SlotReel
              options={locationOptions}
              targetIndex={reelTargets[0]}
              isSpinning={reelStatus[0]}
              delay={0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-center text-[10px] font-black tracking-[0.3em] text-amber-500/40 uppercase">
              Initial
            </span>
            <SlotReel
              options={initialOptions}
              targetIndex={reelTargets[1]}
              isSpinning={reelStatus[1]}
              delay={0.5}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-center text-[10px] font-black tracking-[0.3em] text-amber-500/40 uppercase">
              Winner Name
            </span>
            <SlotReel
              options={nameOptions}
              targetIndex={reelTargets[2]}
              isSpinning={reelStatus[2]}
              delay={1.0}
              isSlowMo={currentAttempt >= totalPlannedFails}
              onStop={handleFinalReelStop}
            />
          </div>
        </div>

        {/* Lever / Handle Decoration (Visual Only) */}
        <div className="group absolute top-1/2 -right-28 hidden -translate-y-1/2 lg:block">
          <div className="h-64 w-10 rounded-full border-2 border-white/10 bg-gradient-to-r from-gray-600 to-gray-800 shadow-2xl" />
          <motion.div
            animate={isSpinning ? { rotate: 45, y: 150 } : { rotate: 0, y: 0 }}
            className="absolute -top-14 -right-6 h-24 w-24 rounded-full border-4 border-white/20 bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.6)]"
          />
        </div>
      </motion.div>

      {/* Action Area Padding */}
      <div className="mt-8 h-24" />

      <DoorprizeRulesModal
        gameTitle="Jackpot Arena"
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        rules={[
          'HANYA PESERTA YANG SUDAH CHECK-IN YANG BERHAK IKUT DIUNDI.',
          'Mesin memiliki 3 kolom: Unit/Alamat, Inisial, dan Nama.',
          "Tekan 'PULL LEVER' untuk memutar mesin jackpot.",
          "Hati-hati! Sistem mungkin mengalami 'glitch' sebelum jackpot.",
          'Menangkan hadiah utama saat ketiga kolom berhenti tepat.',
        ]}
        controls={[
          { key: 'Click', action: 'Pull Lever (Tarik Tuas)' },
          { key: 'Reset', action: 'Muat Ulang Mesin' },
        ]}
      />

      <WinnersListModal
        isOpen={isWinnersListOpen}
        onClose={() => setIsWinnersListOpen(false)}
        eventId={eventId}
      />
    </div>
  )
}
