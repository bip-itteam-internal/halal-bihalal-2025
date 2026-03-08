'use client'

import { User, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DoorprizeHeaderProps {
  aliveCount: number
  totalCount: number
  isAutoRunning: boolean
  isEliminating: boolean
  loading: boolean
  hasCandidates: boolean
  hasWinner: boolean
  onReset: () => void
  onToggleAutoRun: () => void
  onForceRefresh: () => void
}

export function DoorprizeHeader({
  aliveCount,
  totalCount,
  isAutoRunning,
  isEliminating,
  loading,
  hasCandidates,
  hasWinner,
  onReset,
  onToggleAutoRun,
  onForceRefresh,
}: DoorprizeHeaderProps) {
  return (
    <div className="relative z-20 flex items-center justify-between border-b border-white/5 bg-black/20 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-black tracking-[-0.05em] text-white/90">
            Elimination <span className="text-amber-500/80">Grid</span>
          </h1>
          <div className="mt-0.5 flex items-center gap-2 opacity-40">
            <User className="h-3 w-3" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
              {aliveCount} / {totalCount} Remains
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="px-4 text-[10px] font-bold tracking-widest text-white/40 uppercase transition-colors hover:bg-white/5 hover:text-white"
          onClick={onReset}
          disabled={loading || isEliminating}
        >
          Reset
        </Button>

        {!hasWinner && (
          <Button
            className={cn(
              'h-9 rounded-full border border-white/10 px-8 text-xs font-black tracking-widest transition-all',
              isAutoRunning
                ? 'border-rose-500/30 bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
                : 'bg-white/5 text-white hover:bg-white/10',
            )}
            onClick={onToggleAutoRun}
            disabled={loading || !hasCandidates}
          >
            {isAutoRunning ? 'STOP' : 'START ELIMINATION'}
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/20 transition-all hover:text-white active:rotate-180"
          onClick={onForceRefresh}
          disabled={loading || isEliminating || isAutoRunning}
        >
          <RefreshCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>
    </div>
  )
}
