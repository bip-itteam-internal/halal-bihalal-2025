'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import confetti from 'canvas-confetti'
import { Guest } from '@/types'
import { audioManager } from '@/lib/audio-manager'

export function useDoorprize() {
  const [candidates, setCandidates] = useState<Guest[]>([])
  const [aliveIds, setAliveIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isEliminating, setIsEliminating] = useState(false)
  const [isAutoRunning, setIsAutoRunning] = useState(false)
  const [lastBatch, setLastBatch] = useState<string[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const autoRunTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const savedCandidates = localStorage.getItem('doorprize_candidates')
      const savedAliveIds = localStorage.getItem('doorprize_alive_ids')

      if (savedCandidates && savedAliveIds) {
        setCandidates(JSON.parse(savedCandidates))
        setAliveIds(new Set(JSON.parse(savedAliveIds)))
        setLoading(false)
        return
      }

      const res = await fetch('/api/admin/doorprize/eligible')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      const guestData = data.candidates || []
      setCandidates(guestData)
      setAliveIds(new Set(guestData.map((g: Guest) => g.id)))

      localStorage.setItem('doorprize_candidates', JSON.stringify(guestData))
      localStorage.setItem(
        'doorprize_alive_ids',
        JSON.stringify(guestData.map((g: Guest) => g.id)),
      )
    } catch (err: unknown) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (candidates.length > 0) {
      localStorage.setItem(
        'doorprize_alive_ids',
        JSON.stringify(Array.from(aliveIds)),
      )
    }
  }, [aliveIds, candidates.length])

  useEffect(() => {
    fetchCandidates()
    return () => {
      if (autoRunTimer.current) clearInterval(autoRunTimer.current)
    }
  }, [])

  const fireConfetti = () => {
    audioManager.playVictory()
    const duration = 7 * 1000
    const animationEnd = Date.now() + duration
    const defaults = {
      startVelocity: 45,
      spread: 360,
      ticks: 100,
      zIndex: 1000,
      colors: ['#FFD700', '#FFA500', '#FFFFFF', '#FF8C00'],
    }
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min
    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)
      const particleCount = 150 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount: particleCount / 2,
        origin: { x: 0.5, y: 0.5 },
      })
    }, 200)
  }

  const eliminateRandom = useCallback(
    (percentage: number, forcedCount?: number) => {
      if (isEliminating || aliveIds.size <= 1) {
        if (aliveIds.size <= 1) setIsAutoRunning(false)
        return
      }

      setIsEliminating(true)
      const currentAlive = Array.from(aliveIds)

      let countToEliminate =
        forcedCount ||
        Math.max(1, Math.floor(currentAlive.length * (percentage / 100)))

      if (currentAlive.length - countToEliminate < 1) {
        countToEliminate = currentAlive.length - 1
      }

      const shuffled = [...currentAlive].sort(() => Math.random() - 0.5)
      const toEliminate = shuffled.slice(0, countToEliminate)

      audioManager.playElimination()
      setLastBatch(toEliminate)

      setTimeout(() => {
        setAliveIds((prev) => {
          const next = new Set(prev)
          toEliminate.forEach((id) => next.delete(id))
          return next
        })
        setLastBatch([])
        setIsEliminating(false)

        if (currentAlive.length - toEliminate.length === 1) {
          fireConfetti()
          setIsAutoRunning(false)
        }
      }, 500)
    },
    [aliveIds, isEliminating],
  )

  useEffect(() => {
    if (isAutoRunning) {
      const count = aliveIds.size
      let interval = 1200
      if (count <= 3) interval = 5000
      else if (count <= 10) interval = 3000
      else if (count <= 20) interval = 2000
      else if (count <= 50) interval = 1500

      autoRunTimer.current = setInterval(() => {
        if (!isEliminating) {
          const currentCount = aliveIds.size
          if (currentCount > 100) eliminateRandom(20)
          else if (currentCount > 50) eliminateRandom(15)
          else if (currentCount > 20) eliminateRandom(10)
          else if (currentCount > 10) eliminateRandom(0, 2)
          else if (currentCount > 1) eliminateRandom(0, 1)
          else setIsAutoRunning(false)
        }
      }, interval)
    } else {
      if (autoRunTimer.current) clearInterval(autoRunTimer.current)
    }
    return () => {
      if (autoRunTimer.current) clearInterval(autoRunTimer.current)
    }
  }, [isAutoRunning, isEliminating, aliveIds.size, eliminateRandom])

  useEffect(() => {
    if (isAutoRunning && aliveIds.size > 1 && aliveIds.size <= 10) {
      const bpm = aliveIds.size <= 3 ? 140 : 100
      audioManager.startHeartbeat(bpm)
    } else {
      audioManager.stopHeartbeat()
    }
    return () => audioManager.stopHeartbeat()
  }, [isAutoRunning, aliveIds.size])

  const toggleAutoRun = () => {
    if (isAutoRunning) {
      setIsAutoRunning(false)
      setCountdown(null)
      return
    }

    // Start with countdown
    let count = 3
    setCountdown(count)
    audioManager.playTick()

    const timer = setInterval(() => {
      count -= 1
      if (count > 0) {
        setCountdown(count)
        audioManager.playTick()
      } else {
        clearInterval(timer)
        setCountdown(null)
        setIsAutoRunning(true)
      }
    }, 1000)
  }

  const reset = () => {
    setIsAutoRunning(false)
    setCountdown(null)
    const originalIds = new Set(candidates.map((g) => g.id))
    setAliveIds(originalIds)
    setLastBatch([])
    localStorage.setItem(
      'doorprize_alive_ids',
      JSON.stringify(Array.from(originalIds)),
    )
  }

  const forceRefresh = async () => {
    localStorage.removeItem('doorprize_candidates')
    localStorage.removeItem('doorprize_alive_ids')
    setCountdown(null)
    await fetchCandidates()
  }

  const aliveParticipants = useMemo(() => {
    return candidates.filter((g) => aliveIds.has(g.id))
  }, [candidates, aliveIds])

  const winner = useMemo(() => {
    return aliveParticipants.length === 1 ? aliveParticipants[0] : null
  }, [aliveParticipants])

  return {
    candidates,
    aliveIds,
    loading,
    isEliminating,
    isAutoRunning,
    countdown,
    toggleAutoRun,
    lastBatch,
    aliveParticipants,
    winner,
    reset,
    forceRefresh,
    eliminateRandom,
  }
}
