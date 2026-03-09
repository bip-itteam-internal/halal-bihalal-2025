'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Store, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RegistrationForm } from '../registration-form'
import { GuestLoginForm } from '../../auth/guest-login-form'
import { RegistrationSuccess } from '../registration-success'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface RegistrationProps {
  eventId: string
  eventName: string
  regData: {
    external: number
    tenant: number
  }
  quotas: {
    external: number
    tenant: number
  }
  status: 'open' | 'closed'
  activeTab: 'external' | 'tenant'
  onTabChange: (tab: 'external' | 'tenant') => void
}

export function Registration({
  eventId,
  eventName,
  status,
  regData,
  quotas,
  activeTab,
  onTabChange,
}: RegistrationProps) {
  const isOpen = status === 'open'
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register')
  const [successData, setSuccessData] = useState<{
    guest_id: string
    qr_payload: string
    registeredName: string
    registrationType: 'external' | 'tenant'
  } | null>(null)

  const publicQuotaPercent =
    quotas.external > 0
      ? Math.min(100, Math.round((regData.external / quotas.external) * 100))
      : 0

  const handleTabChange = (v: string) => {
    onTabChange(v as 'external' | 'tenant')
    setSuccessData(null)
    setAuthMode('register')
  }

  const renderAuthContent = (type: 'external' | 'tenant') => {
    if (successData) {
      return (
        <div className="animate-in fade-in zoom-in duration-500">
          <RegistrationSuccess
            guestId={successData.guest_id}
            qrPayload={successData.qr_payload}
            registeredName={successData.registeredName}
            registeredGuestType={successData.registrationType}
            inline
          />
          <Button
            variant="ghost"
            onClick={() => setSuccessData(null)}
            className="text-halal-primary/50 hover:text-halal-primary mt-6 w-full"
          >
            Daftar Orang Lain &rarr;
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Info Side */}
          <div className="flex-1 space-y-10 py-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-halal-primary/30 h-px w-12" />
                <span className="text-halal-primary text-[10px] font-black tracking-[0.5em] uppercase">
                  CATEGORY
                </span>
              </div>
              <h2 className="mb-4 text-5xl font-black tracking-tight text-white uppercase md:text-6xl">
                {type === 'external' ? 'DAFTAR ' : 'BOOTH '}
                <span className="text-halal-primary">
                  {type === 'external' ? 'UMUM' : 'UMKM'}
                </span>
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-zinc-400">
                {type === 'external'
                  ? 'Registrasi pengunjung tamu kehormatan & masyarakat umum untuk menghadiri konser akbar.'
                  : 'Dapatkan kesempatan ekspansi bisnis dan jangkau ribuan pengunjung di lokasi acara.'}
              </p>
            </div>

            {type === 'external' ? (
              <div className="max-w-md space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black tracking-[0.3em] uppercase">
                    <span className="text-zinc-500">Ketersediaan Tiket</span>
                    <span className="text-halal-primary">
                      {100 - publicQuotaPercent}% Tersedia
                    </span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${publicQuotaPercent}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="bg-halal-primary absolute inset-y-0 left-0 shadow-[0_0_15px_rgba(223,174,70,0.3)]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase">
                    <span>{regData.external} Terdaftar</span>
                    <span>Kapasitas {quotas.external}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  'Akses Listrik',
                  'Fasilitas Air',
                  'Stand Exclusive',
                  'Tiket Konser',
                ].map((benefit, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
                  >
                    <div className="bg-halal-primary/10 text-halal-primary flex h-8 w-8 items-center justify-center rounded-full">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <span className="text-xs font-bold tracking-wide text-zinc-300 uppercase">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Side */}
          <div className="w-full rounded-[2.5rem] border border-white/5 bg-[#0a1212] p-10 shadow-2xl md:w-[480px]">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white uppercase">
                  {authMode === 'register' ? 'FORM ' : 'AKSES '}
                  <span className="text-halal-primary">
                    {authMode === 'register' ? 'PENDAFTARAN' : 'UNDANGAN'}
                  </span>
                </h3>
                <div className="bg-halal-primary mt-2 h-1 w-12" />
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  setAuthMode(authMode === 'register' ? 'login' : 'register')
                }
                className="text-halal-primary p-0 text-[10px] font-black tracking-[0.2em] uppercase hover:text-white"
              >
                {authMode === 'register' ? 'Sudah Daftar?' : 'Belum Daftar?'}
              </Button>
            </div>

            {authMode === 'register' ? (
              <RegistrationForm
                eventIdentifier={eventId}
                forcedGuestType={type}
                onSuccess={(data) => setSuccessData(data)}
                hideHeader
              />
            ) : (
              <GuestLoginForm eventId={eventId} guestType={type} hideHeader />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="relative z-10 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="border-halal-primary/30 bg-halal-primary/10 inline-block rounded-full border px-6 py-2 backdrop-blur-md"
          >
            <span className="text-halal-primary text-[10px] font-black tracking-[0.4em] uppercase">
              JOIN THE CELEBRATION
            </span>
          </motion.div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase md:text-6xl">
            RESERVASI <span className="text-halal-primary">TEMPAT</span>
          </h2>
          <p className="mx-auto max-w-xl text-zinc-400">
            Pilih kategori pendaftaran Anda dan dapatkan akses eksklusif ke
            malam silaturahmi akbar tahun ini.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div
            id="register-section"
            className="mx-auto mb-16 max-w-sm scroll-mt-24"
          >
            <TabsList className="grid h-16 w-full grid-cols-2 rounded-2xl border border-white/5 bg-black/40 p-1.5 backdrop-blur-xl">
              <TabsTrigger
                value="external"
                className="data-[state=active]:bg-halal-primary data-[state=active]:text-halal-secondary rounded-xl text-xs font-black tracking-widest uppercase transition-all"
              >
                Umum
              </TabsTrigger>
              <TabsTrigger
                value="tenant"
                className="data-[state=active]:bg-halal-primary data-[state=active]:text-halal-secondary rounded-xl text-xs font-black tracking-widest uppercase transition-all"
              >
                UMKM
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="external" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d1f1e]/60 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl md:p-12 lg:p-16"
            >
              {renderAuthContent('external')}
            </motion.div>
          </TabsContent>

          <TabsContent value="tenant" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d1f1e]/60 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl md:p-12 lg:p-16"
            >
              {renderAuthContent('tenant')}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
