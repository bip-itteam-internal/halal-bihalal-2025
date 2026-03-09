'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GuestLoginForm } from './guest-login-form'
import { RegistrationForm } from '../register/registration-form'
import { RegistrationSuccess } from '../register/registration-success'

interface GuestAuthModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventName: string
  guestType: 'internal' | 'tenant' | 'external'
  defaultTab?: 'login' | 'register'
}

export function GuestAuthModal({
  isOpen,
  onClose,
  eventId,
  eventName,
  guestType,
  defaultTab = 'login',
}: GuestAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [successData, setSuccessData] = useState<{
    guest_id: string
    qr_payload: string
    registeredName: string
    registrationType: 'external' | 'tenant'
  } | null>(null)

  // Reset tab when modal opens with a different default
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab)
      setSuccessData(null)
    }
  }, [isOpen, defaultTab])

  const showRegistration = guestType !== 'internal'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden rounded-[2rem] border-amber-500/20 bg-[#041d1a] p-0 text-white sm:max-w-[500px]">
        {successData ? (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-amber-500 uppercase">
                Pendaftaran Berhasil
              </DialogTitle>
            </div>
            <RegistrationSuccess
              guestId={successData.guest_id}
              qrPayload={successData.qr_payload}
              registeredName={successData.registeredName}
              registeredGuestType={successData.registrationType}
              inline
            />
          </div>
        ) : (
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-black tracking-tight text-white uppercase">
                Akses <span className="text-amber-500">Undangan</span>
              </DialogTitle>
              <p className="text-xs font-medium text-slate-400">{eventName}</p>
            </DialogHeader>

            {showRegistration ? (
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'login' | 'register')}
                className="w-full"
              >
                <TabsList className="mb-6 grid w-full grid-cols-2 rounded-xl border border-white/5 bg-black/40 p-1">
                  <TabsTrigger
                    value="login"
                    className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                  >
                    Masuk
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                  >
                    Daftar
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="mt-0 outline-none">
                  <GuestLoginForm
                    eventId={eventId}
                    guestType={guestType}
                    onSuccess={onClose}
                    hideHeader
                  />
                </TabsContent>
                <TabsContent value="register" className="mt-0 outline-none">
                  <RegistrationForm
                    eventIdentifier={eventId}
                    forcedGuestType={guestType as 'external' | 'tenant'}
                    onSuccess={(data) => setSuccessData(data)}
                    hideHeader
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <GuestLoginForm
                eventId={eventId}
                guestType="internal"
                onSuccess={onClose}
                hideHeader
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
