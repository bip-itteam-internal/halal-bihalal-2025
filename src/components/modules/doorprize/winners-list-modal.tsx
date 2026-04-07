'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Medal, RefreshCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DoorprizeWinner {
  id: string
  guest_id: string
  winner_name: string
  institution_name: string
  category: string
  won_at: string
}

interface WinnersListModalProps {
  isOpen: boolean
  onClose: () => void
  eventId?: string
}

export function WinnersListModal({
  isOpen,
  onClose,
  eventId,
}: WinnersListModalProps) {
  const [winners, setWinners] = useState<DoorprizeWinner[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; guestId: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchWinners = async () => {
    try {
      setLoading(true)
      const url = eventId
        ? `/api/admin/doorprize/winners?event_id=${eventId}`
        : '/api/admin/doorprize/winners'
      const res = await fetch(url)
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

  const handleDelete = async () => {
    if (!confirmDelete) return
    
    try {
      setIsDeleting(true)
      const res = await fetch(`/api/admin/doorprize/winners?id=${confirmDelete.id}&guest_id=${confirmDelete.guestId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setConfirmDelete(null)
        fetchWinners()
      }
    } catch (err) {
      console.error('Failed to delete winner:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchWinners()
    }
  }, [isOpen])

  const bharataWinners = winners.filter(w => w.category === 'Bharata Group')
  const sponsorshipWinners = winners.filter(w => w.category !== 'Bharata Group')

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
          className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#111] to-[#050505] p-6 shadow-[0_0_100px_rgba(0,0,0,1)] sm:p-10"
        >
          {/* Background Decor */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-600/10 blur-[80px]" />

          {/* Delete Confirmation Overlay */}
          <AnimatePresence>
            {confirmDelete && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#111] p-8 text-center shadow-2xl"
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <Trash2 className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-black tracking-tight text-white uppercase italic">
                    Hapus Pemenang?
                  </h3>
                  <p className="mb-8 text-xs font-bold leading-relaxed text-slate-400">
                    <span className="text-white">"{confirmDelete.name}"</span> akan dihapus dari daftar dan dapat diundi kembali.
                  </p>
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setConfirmDelete(null)}
                      className="h-12 flex-1 rounded-xl border-white/10 bg-white/5 font-black tracking-widest text-slate-400 uppercase hover:bg-white/10"
                      disabled={isDeleting}
                    >
                      Batal
                    </Button>
                    <Button 
                      onClick={handleDelete}
                      className="h-12 flex-1 rounded-xl bg-red-600 font-black tracking-widest text-white uppercase shadow-lg shadow-red-600/20 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Hapus..." : "Ya, Hapus"}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 z-20 rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>

          <div className="relative z-10 flex h-full flex-col space-y-8">
            {/* Header */}
            <div className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-[10px] font-black tracking-[0.4em] text-amber-500 uppercase">
                HALL OF FAME
              </h2>
              <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
                DAFTAR <span className="text-amber-500">PEMENANG</span>
              </h1>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={fetchWinners}
                disabled={loading}
                className="h-12 w-full rounded-xl border-white/10 bg-white/5 font-bold text-slate-400 hover:bg-white/10 sm:w-auto"
              >
                <RefreshCcw
                   className={cn('mr-2 h-4 w-4', loading && 'animate-spin')}
                />
                REFRESH DAFTAR
              </Button>
            </div>

            {/* Content Area - 2 Columns */}
            <div className="flex-1 overflow-hidden">
              {loading && winners.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 text-white/20">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent" />
                  <p className="text-xs font-bold tracking-widest uppercase">
                    Mengambil data...
                  </p>
                </div>
              ) : winners.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.02] text-slate-600">
                  <Medal className="h-12 w-12 opacity-10" />
                  <p className="text-xs font-bold tracking-widest uppercase">
                    Belum ada pemenang
                  </p>
                </div>
              ) : (
                <div className="grid h-full grid-cols-1 gap-8 md:grid-cols-2">
                  {/* BHARATA GROUP COLUMN */}
                  <div className="flex flex-col space-y-4 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                      <h3 className="flex items-center gap-2 text-xs font-black tracking-widest text-blue-400 uppercase">
                        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        BHARATA GROUP
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500">
                        {bharataWinners.length} PEMENANG
                      </span>
                    </div>
                    <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
                      <div className="space-y-3 pb-4">
                        {bharataWinners.length === 0 ? (
                          <div className="bg-white/[0.02] flex items-center justify-center rounded-2xl border border-dashed border-white/5 py-12">
                            <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                              Kosong
                            </p>
                          </div>
                        ) : (
                          bharataWinners.map((winner, i) => (
                            <WinnerCard 
                              key={winner.id} 
                              winner={winner} 
                              index={i} 
                              rank={i + 1} 
                              onDelete={() => setConfirmDelete({ 
                                id: winner.id, 
                                guestId: winner.guest_id, 
                                name: winner.winner_name 
                              })}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SPONSORSHIP COLUMN */}
                  <div className="flex flex-col space-y-4 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                      <h3 className="flex items-center gap-2 text-xs font-black tracking-widest text-emerald-400 uppercase">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        SPONSORSHIP
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500">
                        {sponsorshipWinners.length} PEMENANG
                      </span>
                    </div>
                    <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
                      <div className="space-y-3 pb-4">
                        {sponsorshipWinners.length === 0 ? (
                          <div className="bg-white/[0.02] flex items-center justify-center rounded-2xl border border-dashed border-white/5 py-12">
                            <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                              Kosong
                            </p>
                          </div>
                        ) : (
                          sponsorshipWinners.map((winner, i) => (
                            <WinnerCard 
                              key={winner.id} 
                              winner={winner} 
                              index={i} 
                              rank={i + 1} 
                              isExternal 
                              onDelete={() => setConfirmDelete({ 
                                id: winner.id, 
                                guestId: winner.guest_id, 
                                name: winner.winner_name 
                              })}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 text-center text-[9px] font-bold tracking-[0.5em] text-white/20 uppercase">
              HALAL BIHALAL 2025 • TOTAL {winners.length} PEMENANG
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

function WinnerCard({ 
  winner, 
  index, 
  rank,
  onDelete,
  isExternal = false
}: { 
  winner: DoorprizeWinner, 
  index: number,
  rank: number,
  onDelete?: () => void,
  isExternal?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isExternal ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 transition-all hover:border-amber-500/20 hover:bg-white/[0.06]"
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black text-black shadow-lg",
        isExternal 
          ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
          : "bg-gradient-to-br from-blue-400 to-blue-600"
      )}>
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base leading-none font-black text-white">
            {winner.winner_name}
          </p>
          {index === 0 && (
            <span className="rounded border border-amber-500/30 bg-amber-500/20 px-1 py-0.5 text-[7px] font-black tracking-tighter text-amber-500 uppercase">
              NEW
            </span>
          )}
        </div>
        <div className="mt-0.5 opacity-60">
          <p className="truncate text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {winner.institution_name}
          </p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.()
        }}
        className="ml-auto opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-500"
        title="Hapus Pemenang"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  )
}
