import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Monitor, 
  Gamepad2, 
  Keyboard, 
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DoorprizeRulesModalProps {
  gameTitle: string
  rules: string[]
  controls?: { key: string; action: string }[]
  isOpen: boolean
  onClose: () => void
}

export function DoorprizeRulesModal({
  gameTitle,
  rules,
  controls,
  isOpen,
  onClose
}: DoorprizeRulesModalProps) {
  if (!isOpen) return null

  const handleStart = () => {
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 1.1, y: -20, opacity: 0 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#111] to-[#050505] p-8 shadow-[0_0_100px_rgba(0,0,0,1)] sm:p-12"
        >
          {/* Background Decor */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-red-600/10 blur-[80px]" />

          <div className="relative z-10 space-y-10">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/50">
                <Trophy className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-[10px] font-black tracking-[0.4em] text-amber-500/60 uppercase">
                  PANDUAN OPERATOR
                </h2>
                <h1 className="text-4xl font-black tracking-tight text-white uppercase italic sm:text-5xl">
                  {gameTitle}
                </h1>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Rules Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/40 uppercase">
                  <Gamepad2 className="h-3 w-3" />
                  Aturan Main
                </div>
                <div className="space-y-3">
                  {rules.map((rule, i) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <p className="leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/40 uppercase">
                    <Monitor className="h-3 w-3" />
                    Tampilan
                  </div>
                  <div className="flex items-start gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 ring-1 ring-white/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-black shadow-lg">
                      <span className="font-black text-xs">F11</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-white text-sm">Full Screen Mode</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Tekan <span className="font-bold text-amber-500">F11</span> sekarang untuk pengalaman layar penuh yang maksimal.
                      </p>
                    </div>
                  </div>
                </div>

                {controls && controls.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/40 uppercase">
                      <Keyboard className="h-3 w-3" />
                      Shortcut
                    </div>
                    <div className="space-y-2">
                      {controls.map((ctrl, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2 border border-white/5 text-sm">
                          <span className="text-slate-400 font-medium">{ctrl.action}</span>
                          <kbd className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-black text-white ring-1 ring-white/20 uppercase">
                            {ctrl.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-4 text-center">
              <Button
                onClick={handleStart}
                className="h-16 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-xl font-black text-black shadow-[0_10px_30px_rgba(245,158,11,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                SAYA MENGERTI, MULAI GAME!
              </Button>
              <p className="mt-4 text-[10px] font-bold tracking-widest text-white/20 uppercase">
                Pastikan audio sudah menyala agar lebih seru
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
