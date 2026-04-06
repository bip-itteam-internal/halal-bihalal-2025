'use client'

import { Guest, Event as AppEvent } from '@/types'
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
  checkin?: unknown | null
  onSelfCheckin?: () => Promise<void>
  isCheckinEnabled?: boolean
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
  checkin,
  onSelfCheckin,
  isCheckinEnabled,
}: TemplateRendererProps) {
  // If templateId is not set, or it's a legacy ID that doesn't match our new ones,
  // we can either show a default new template or the legacy one (if we want to keep it).
  // Given the user wants to switch to this "ready-to-use" approach, let's prioritize new ones.

  switch (templateId) {
    case 'corporate-modern':
      return (
        <ModernCorporate
          event={event}
          guest={guest}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onRSVP={onRSVP}
          isUpdating={isUpdating}
          openGate={openGate}
          startTime={startTime}
          onTicketView={onTicketView}
          checkin={checkin}
          onSelfCheckin={onSelfCheckin}
          isCheckinEnabled={isCheckinEnabled}
        />
      )
    case 'festive-halal':
      return (
        <TraditionalHalal
          event={event}
          guest={guest}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onRSVP={onRSVP}
          isUpdating={isUpdating}
          openGate={openGate}
          startTime={startTime}
          onTicketView={onTicketView}
          checkin={checkin}
          onSelfCheckin={onSelfCheckin}
          isCheckinEnabled={isCheckinEnabled}
        />
      )
    default:
      // Default fallback if no valid template_id is found
      return (
        <ModernCorporate
          event={event}
          guest={guest}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onRSVP={onRSVP}
          isUpdating={isUpdating}
          openGate={openGate}
          startTime={startTime}
          onTicketView={onTicketView}
          checkin={checkin}
          isCheckinEnabled={isCheckinEnabled}
        />
      )
  }
}
