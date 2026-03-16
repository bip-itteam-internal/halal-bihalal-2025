'use client'

import React from 'react'
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
  paymentStatus?: 'pending' | 'verified' | 'rejected'
  paymentProofUrl?: string | null
  isUpdatingPaymentProof?: boolean
  onUpdatePaymentProof?: (file: File) => Promise<void>
  openGate?: string | null
  startTime?: string | null
  onTicketView?: (visible: boolean) => void
}

export function TemplateRenderer({
  templateId,
  event,
  guest,
  isOpen,
  setIsOpen,
  onRSVP,
  isUpdating,
  paymentStatus,
  paymentProofUrl,
  isUpdatingPaymentProof,
  onUpdatePaymentProof,
  openGate,
  startTime,
  onTicketView,
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
          paymentStatus={paymentStatus}
          paymentProofUrl={paymentProofUrl}
          isUpdatingPaymentProof={isUpdatingPaymentProof}
          onUpdatePaymentProof={onUpdatePaymentProof}
          openGate={openGate}
          startTime={startTime}
          onTicketView={onTicketView}
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
          paymentStatus={paymentStatus}
          paymentProofUrl={paymentProofUrl}
          isUpdatingPaymentProof={isUpdatingPaymentProof}
          onUpdatePaymentProof={onUpdatePaymentProof}
          openGate={openGate}
          startTime={startTime}
          onTicketView={onTicketView}
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
          paymentStatus={paymentStatus}
          paymentProofUrl={paymentProofUrl}
          isUpdatingPaymentProof={isUpdatingPaymentProof}
          onUpdatePaymentProof={onUpdatePaymentProof}
          openGate={openGate}
          startTime={startTime}
          onTicketView={onTicketView}
        />
      )
  }
}
