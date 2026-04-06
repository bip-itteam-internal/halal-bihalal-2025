import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  X,
  Medal,
  RefreshCcw,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Guest } from '@/types'
import { cn } from '@/lib/utils'

interface WinnersListModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WinnersListModal({
  isOpen,
  onClose
}: WinnersListModalProps) {
  const [winners, setWinners] = useState<Guest[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const fetchWinners = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/doorprize/winners')
      const data = await res.json()
      if (res.ok) {
        setWinners(data.winners || [])
      }
    } catch (err) {
      console.error('Failed to fetch winners:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchWinners()
    }
  }, [isOpen])

  const filteredWinners = winners.filter(w => 
    w.full_name.toLowerCase().includes(search.toLowerCase()) ||
    w.address?.toLowerCase().includes(search.toLowerCase())
  )

  if (!isOpen) return null

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
          className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#111] to-[#050505] p-6 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col max-h-[85vh] sm:p-10"
        >
          {/* Background Decor */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-600/10 blur-[80px]" />

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>

          <div className="relative z-10 flex flex-col h-full space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/50 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-[10px] font-black tracking-[0.4em] text-amber-500 uppercase">
                HALL OF FAME
              </h2>
              <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
                DAFTAR <span className="text-amber-500">PEMENANG</span>
              </h1>
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Cari nama pemenang..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all text-white placeholder:text-slate-600"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={fetchWinners} 
                disabled={loading}
                className="h-11 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 font-bold"
              >
                <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                REFRESH
              </Button>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {loading && winners.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-white/20">
                  <div className="h-10 w-10 border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                  <p className="font-bold tracking-widest text-xs uppercase">Mengambil data...</p>
                </div>
              ) : filteredWinners.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-600 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                  <Medal className="h-12 w-12 opacity-10" />
                  <p className="font-bold tracking-widest text-xs uppercase">
                    {search ? 'Pemenang tidak ditemukan' : 'Belum ada pemenang'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  {filteredWinners.map((winner, i) => (
                    <motion.div
                      key={winner.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06] hover:border-amber-500/20"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-lg shadow-lg">
                         {winners.length - i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <p className="font-black text-lg text-white truncate leading-tight">
                            {winner.full_name}
                           </p>
                           {i === 0 && (
                             <span className="bg-amber-500/20 text-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-500/30 uppercase tracking-tighter">
                               TERBARU
                             </span>
                           )}
                        </div>
                        <div className="flex gap-2 mt-1">
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                             {winner.address || 'Internal'}
                           </span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <Medal className="h-5 w-5 text-amber-500/40" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 text-center">
              <p className="text-[9px] font-bold tracking-[0.5em] text-white/20 uppercase">
                TOTAL {winners.length} PEMENANG SAAT INI
              </p>
            </div>
          </div>
        </motion.div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  )
}
