'use client'

import { useState, useEffect } from 'react'
import { Guest } from '@/types'
import { audioManager } from '@/lib/audio-manager'

export function useEnvelopeWall(eventId?: string) {
  const [candidates, setCandidates] = useState<Guest[]>([])
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [mapping, setMapping] = useState<Record<number, Guest>>({})
  const [lastWinner, setLastWinner] = useState<Guest | null>(null)

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const url = eventId 
        ? `/api/admin/doorprize/eligible?event_id=${eventId}`
        : '/api/admin/doorprize/eligible'
      const res = await fetch(url)
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

  const setWinnerToDatabase = async (guest: Guest, categoryOverride?: string) => {
    try {
      await fetch('/api/admin/doorprize/winners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_id: guest.id,
          event_id: eventId,
          winner_name: guest.full_name,
          institution_name: guest.address || '-',
          category: categoryOverride || (guest.guest_type === 'internal' ? 'Bharata Group' : 'Sponsorship')
        }),
      })
    } catch (err) {
      console.error('Failed to update winner in database:', err)
    }
  }

  const openEnvelope = (index: number, categoryOverride?: string) => {
    const guest = mapping[index]
    if (!guest || openedIds.has(guest.id)) return

    audioManager.playTick()
    
    setWinnerToDatabase(guest, categoryOverride)
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
