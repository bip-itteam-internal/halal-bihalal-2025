'use client'

import { useState, useEffect } from 'react'
import { Guest } from '@/types'
import { audioManager } from '@/lib/audio-manager'

export function useEnvelopeWall() {
  const [candidates, setCandidates] = useState<Guest[]>([])
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [mapping, setMapping] = useState<Record<number, Guest>>({})
  const [lastWinner, setLastWinner] = useState<Guest | null>(null)

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/doorprize/eligible')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      const guestData = data.candidates || []
      setCandidates(guestData)
      
      // Shuffle and create mapping
      const shuffled = [...guestData].sort(() => Math.random() - 0.5)
      const newMapping: Record<number, Guest> = {}
      shuffled.forEach((guest, index) => {
        newMapping[index + 1] = guest
      })
      setMapping(newMapping)
      
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)

  const openEnvelope = (index: number) => {
    const guest = mapping[index]
    if (!guest || openedIds.has(guest.id)) return

    audioManager.playTick()
    
    setOpenedIds((prev) => new Set(prev).add(guest.id))
    setLastWinner(guest)
    setSelectedNumber(null) // Close preview
  }

  const reset = () => {
    setOpenedIds(new Set())
    setLastWinner(null)
    setSelectedNumber(null)
    const shuffled = [...candidates].sort(() => Math.random() - 0.5)
    const newMapping: Record<number, Guest> = {}
    shuffled.forEach((guest, index) => {
      newMapping[index + 1] = guest
    })
    setMapping(newMapping)
  }

  return {
    candidates,
    mapping,
    openedIds,
    loading,
    openEnvelope,
    lastWinner,
    reset,
    setLastWinner,
    selectedNumber,
    setSelectedNumber,
  }
}
