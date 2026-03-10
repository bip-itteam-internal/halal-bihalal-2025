'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import slugify from 'slugify'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RegistrationForm } from '../registration-form'
import { GuestLoginForm } from '../../auth/guest-login-form'
import { RegistrationSuccess } from '../registration-success'
import { EventGuestRule } from '@/types'

interface RegistrationProps {
  eventId: string
  eventName?: string
  regData: {
    external: number
    tenant: number
  }
  quotas: {
    external: number
    tenant: number
  }
  activeTab: 'external' | 'tenant'
  onTabChange: (tab: 'external' | 'tenant') => void
  guestRules?: EventGuestRule[]
}

export function Registration({
  eventId,
  eventName,
  regData,
  quotas,
  guestRules,
}: Omit<RegistrationProps, 'activeTab' | 'onTabChange'>) {
  const router = useRouter()
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

  const renderAuthContent = () => {
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
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">
        {/* Info Side */}
        <div className="flex-1 space-y-8 py-4">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-halal-primary/40 h-px w-12" />
              <span className="text-halal-primary text-[10px] font-black tracking-[0.5em] uppercase">
                PUBLIC REGISTRATION
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-outfit text-3xl font-black tracking-tight text-white uppercase md:text-5xl">
                DAFTAR <span className="text-halal-primary">UMUM</span>
              </h3>
              <p className="max-w-md text-base leading-relaxed text-zinc-400 md:text-lg">
                Daftar sekarang untuk mendapatkan tiket dan mengikuti rangkaian
                acara silaturahmi.
              </p>
            </div>

            {/* Open Gate Info */}
            {guestRules?.find((r) => r.guest_type === 'external') && (
              <div className="border-halal-primary/20 bg-halal-primary/5 group hover:border-halal-primary/40 flex items-center gap-5 rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300">
                <div className="bg-halal-primary/20 text-halal-primary flex h-14 w-14 items-center justify-center rounded-xl shadow-[inset_0_0_15px_rgba(var(--halal-primary-rgb),0.2)]">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <span className="text-halal-primary block text-[10px] font-black tracking-[0.3em] uppercase opacity-70">
                    OPEN GATE
                  </span>
                  <p className="text-2xl font-bold text-white md:text-3xl">
                    {guestRules
                      ?.find((r) => r.guest_type === 'external')
                      ?.open_gate?.substring(0, 5)
                      .replace(':', '.') || '--.--'}{' '}
                    WIB
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-xs space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black tracking-[0.2em] uppercase">
              <span className="text-zinc-500">Ketersediaan Tiket</span>
              <span className="text-halal-primary">
                {quotas.external - regData.external} / {quotas.external}
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${publicQuotaPercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="bg-halal-primary absolute inset-y-0 left-0 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="relative w-full lg:w-[480px]">
          <div className="bg-halal-primary/5 absolute -inset-4 -z-10 opacity-50 blur-3xl" />
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0a1212]/80 p-8 shadow-2xl backdrop-blur-md md:p-10">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-10">
              <div>
                <h3 className="text-xl font-black tracking-tight text-white uppercase md:text-2xl">
                  {authMode === 'register' ? 'FORM ' : 'AKSES '}
                  <span className="text-halal-primary">
                    {authMode === 'register' ? 'PENDAFTARAN' : 'UNDANGAN'}
                  </span>
                </h3>
                <div className="bg-halal-primary mt-3 h-1 w-12 rounded-full" />
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  setAuthMode(authMode === 'register' ? 'login' : 'register')
                }
                className="text-halal-primary h-auto p-0 text-[10px] font-black tracking-[0.2em] uppercase hover:text-white sm:text-right"
              >
                {authMode === 'register' ? 'Sudah Daftar?' : 'Belum Daftar?'}
              </Button>
            </div>

            {authMode === 'register' ? (
              <RegistrationForm
                eventIdentifier={eventId}
                forcedGuestType="external"
                onSuccess={(data) => {
                  const nameSlug = slugify(data.registeredName || '', {
                    lower: true,
                    strict: true,
                  })
                  const eventSlug = slugify(eventName || '', {
                    lower: true,
                    strict: true,
                  })
                  router.push(
                    `/invite/${data.guest_id}-${nameSlug}-${eventSlug}`,
                  )
                }}
                hideHeader
              />
            ) : (
              <GuestLoginForm
                eventId={eventId}
                guestType="external"
                hideHeader
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="relative z-10 overflow-hidden py-16 md:py-24">
      {/* Background Decor */}
      <div className="bg-halal-primary/10 absolute top-0 left-1/2 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full opacity-50 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-20 space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-halal-primary/20 bg-halal-primary/5 inline-flex items-center gap-2 rounded-full border px-5 py-2 ring-1 ring-white/5 backdrop-blur-2xl"
          >
            <div className="bg-halal-primary h-1.5 w-1.5 animate-pulse rounded-full shadow-[0_0_8px_rgba(var(--halal-primary-rgb),0.8)]" />
            <span className="text-halal-primary text-[10px] font-black tracking-[0.5em] uppercase">
              Join The Celebration
            </span>
          </motion.div>

          <h2 className="font-outfit relative flex flex-col items-center justify-center gap-2 text-5xl font-black tracking-tighter uppercase md:text-8xl">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              Booking Tiket
            </span>
            <span className="text-halal-primary relative drop-shadow-[0_10px_30px_rgba(var(--halal-primary-rgb),0.5)]">
              Free HTM
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 1.2, ease: 'circOut' }}
                className="bg-halal-primary/40 absolute -bottom-2 left-0 h-2 rounded-full blur-[2px]"
              />
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400/80 md:text-xl">
            Amankan tiket Anda sekarang untuk menghadiri{' '}
            <span className="font-medium text-white">acara silaturahmi</span>{' '}
            tahun ini.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-[3.2rem] p-[2px]">
          {/* Animated Border Glow */}
          <div className="from-halal-primary/20 to-halal-primary/20 absolute inset-0 bg-gradient-to-r via-white/10 bg-[length:200%_auto] opacity-50" />

          <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0a1817]/60 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
            <div className="relative bg-gradient-to-b from-white/[0.02] to-transparent p-8 md:p-12 lg:p-16">
              {renderAuthContent()}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
