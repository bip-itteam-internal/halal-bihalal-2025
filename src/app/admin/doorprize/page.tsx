'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MoveLeft,
  Trophy,
  Sparkles,
  RefreshCcw,
  PartyPopper,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { Guest } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/layout/app-layout'

export default function DoorprizePage() {
  const [candidates, setCandidates] = useState<Guest[]>([])
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/admin/doorprize/eligible')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setCandidates(data.candidates || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat peserta')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const startSpin = useCallback(() => {
    if (candidates.length === 0) return

    setSpinning(true)
    setWinner(null)
    setError('')

    const startTime = Date.now()
    const duration = 3000

    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * candidates.length)
      setWinner(candidates[randomIndex])

      if (Date.now() - startTime > duration) {
        clearInterval(spinInterval)
        setSpinning(false)
        fireConfetti()
      }
    }, 100)
  }, [candidates])

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#fbbf24', '#ffffff'],
    })
  }

  return (
    <AppLayout>
      <main className="bg-background relative flex flex-1 flex-col overflow-hidden">
        <div className="z-10 flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="icon">
                <MoveLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-amber-500" />
              <h1 className="text-2xl font-bold tracking-tight">Luck Engine</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCandidates}
            disabled={loading || spinning}
          >
            <RefreshCcw
              className={cn('mr-2 h-4 w-4', loading && 'animate-spin')}
            />
            {loading ? 'Refreshing...' : 'Refresh Participants'}
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="w-full max-w-2xl space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-foreground/80 text-xl font-semibold tracking-tight">
                Ready to find the lucky one?
              </h2>
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                {candidates.length} CANDIDATES ELIGIBLE
              </Badge>
            </div>

            <Card className="flex min-h-[300px] items-center justify-center p-8">
              <CardContent className="flex w-full flex-col items-center justify-center p-0">
                {winner ? (
                  <div
                    className={cn(
                      'flex w-full flex-col items-center justify-center space-y-8 transition-opacity duration-300',
                      spinning ? 'opacity-50' : 'opacity-100',
                    )}
                  >
                    <Trophy
                      className={cn(
                        'h-24 w-24',
                        spinning ? 'text-muted-foreground' : 'text-amber-500',
                      )}
                    />

                    <div className="space-y-2 text-center">
                      <h3 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                        {winner.full_name}
                      </h3>
                      <p className="text-muted-foreground text-lg font-semibold tracking-widest uppercase">
                        {spinning ? '••••••••' : 'WINNER'}
                      </p>
                    </div>

                    {!spinning && (
                      <div className="flex items-center gap-2 pt-4">
                        <Sparkles className="h-5 w-5 animate-pulse text-amber-500" />
                        <span className="text-sm font-bold tracking-widest uppercase">
                          Congratulations!
                        </span>
                        <Sparkles className="h-5 w-5 animate-pulse text-amber-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center justify-center space-y-4">
                    <User className="h-16 w-16" />
                    <p className="text-sm">
                      Tap the draw button below to initiate the randomization
                      engine
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="pt-8">
              <Button
                disabled={spinning || candidates.length === 0}
                onClick={startSpin}
                size="lg"
                className="h-16 w-full text-xl font-bold tracking-wider sm:w-auto sm:px-16"
              >
                {spinning ? 'RANDOMIZING...' : 'DRAW NOW'}
              </Button>

              {error && (
                <p className="text-destructive mt-6 text-sm font-medium">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
