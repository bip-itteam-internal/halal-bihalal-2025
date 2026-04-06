'use client'

import { Guest, Event as AppEvent, Checkin } from '@/types'
import { ModernCorporate } from './templates/corporate/ModernCorporate'
import { TraditionalHalal } from './templates/festive/TraditionalHalal'

interface TemplateRendererProps {
  templateId?: string | null
  event: AppEvent
  guest: Guest
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onRSVP: (status: 'confirmed' | 'declined' | 'pending') => void
  isUpdating: boolean
  openGate?: string | null
  startTime?: string | null
  onTicketView?: (visible: boolean) => void
  checkins?: Checkin[] | null
  onSelfCheckinStep?: (step: 'exchange' | 'entrance') => Promise<void>
  isHalalEnabled?: boolean
  isConcertEnabled?: boolean
  latitude?: number | null
  longitude?: number | null
}

export function TemplateRenderer({
  templateId,
  event,
  guest,
  isOpen,
  setIsOpen,
  onRSVP,
  isUpdating,
  openGate,
  startTime,
  onTicketView,
  checkins,
  onSelfCheckinStep,
  isHalalEnabled,
  isConcertEnabled,
  latitude,
  longitude,
}: TemplateRendererProps) {
  // ... (keeping switch logic)
  const commonProps = {
    event,
    guest,
    isOpen,
    setIsOpen,
    onRSVP,
    isUpdating,
    openGate,
    startTime,
    onTicketView,
    checkins,
    onSelfCheckinStep,
    isHalalEnabled,
    isConcertEnabled,
    latitude,
    longitude,
  }

  switch (templateId) {
    case 'corporate-modern':
      return <ModernCorporate {...commonProps} />
    case 'festive-halal':
      return <TraditionalHalal {...commonProps} />
    default:
      return <ModernCorporate {...commonProps} />
  }
}
