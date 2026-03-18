'use client'

import { motion } from 'framer-motion'
import { Timer, Trophy, Star, ArrowRight, Zap, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { useDoorprize } from '@/hooks/use-doorprize'
import { Particles, ShootingStars } from '@/components/ui/particles'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const GAMES = [
  {
    id: 'wall',
    title: 'Wall of Fortune',
    description:
      'Pilih nomor amplop di dinding keberuntungan untuk membuka identitas pemenang doorprize.',
    icon: LayoutGrid,
    color: 'from-red-500 to-rose-700',
    url: '/admin/doorprize/wall',
    stats: 'Envelope Pick',
    tag: 'EKSKLUSIF',
  },
  {
    id: 'slot',
    title: 'Jackpot Slot',
    description:
      'Gaya kasino klasik! Nama-nama berputar di kolom vertikal dan berhenti satu per satu untuk jackpot.',
    icon: Zap,
    color: 'from-red-600 to-amber-600',
    url: '/admin/doorprize/slot',
    stats: 'Big Prize Mode',
    tag: 'JACKPOT',
  },
  {
    id: 'survivor',
    title: 'Survivor Elimination',
    description:
      'Mode eliminasi bertahap untuk mencari satu pemenang terakhir. Menegangkan dan seru!',
    icon: Timer,
    color: 'from-amber-500 to-amber-700',
    theme: 'halal',
    url: '/admin/doorprize/survivor',
    stats: 'Last Man Standing',
    tag: 'FAVORIT',
  },
]


export default function DoorprizeSelectorPage() {
  const { candidates, loading } = useDoorprize()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050c0b] text-white">
      {/* Background Layer */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Particles count={50} />
        <ShootingStars />
        <div className="bg-halal-primary/5 absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:py-24">
        {/* Header */}
        <div className="mb-16 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-halal-primary/20 text-halal-primary shadow-inner backdrop-blur-md"
          >
            <Trophy className="h-10 w-10" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-outfit text-5xl font-black tracking-tight md:text-7xl">
              DOORPRIZE <span className="text-halal-primary">ARENA</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              Pilih mode permainan untuk menentukan pemenang doorprize. Setiap
              game memiliki cara unik dalam pemilihan kandidat.
            </p>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx + 0.3 }}
              whileHover={{ y: -10 }}
            >
              <Card
                className={`group relative h-full overflow-hidden border-white/5 bg-black/40 backdrop-blur-xl transition-all hover:border-halal-primary/50`}
              >
                {/* Decoration */}
                <div
                  className={`absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br transition-opacity group-hover:opacity-100 ${game.color} opacity-20 blur-3xl`}
                />

                <CardHeader className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${game.color}`}
                    >
                      <game.icon className="h-6 w-6" />
                    </div>
                    {game.tag && (
                      <span className="bg-halal-primary text-halal-secondary rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase">
                        {game.tag}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="font-outfit text-2xl font-bold text-white">
                      {game.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-slate-400">
                      {game.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="relative flex flex-col justify-between">
                  <div className="mb-6 flex items-center gap-2">
                    <Star className="h-4 w-4 text-halal-primary" />
                    <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                      {game.stats}
                    </span>
                  </div>

                  <Link href={game.url} className="w-full">
                    <Button className="bg-halal-primary text-halal-secondary hover:bg-halal-primary/90 group w-full rounded-xl font-bold transition-all">
                      Mulai Game
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-24 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-6 py-3 text-sm text-slate-400 backdrop-blur-md">
            <Trophy className="h-4 w-4 text-halal-primary" />
            Total kandidat siap diundi:{' '}
            <span className="font-bold text-white">
              {loading ? 'Mengecek...' : `${candidates.length} Orang`}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
