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
import Link from 'next/link'

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
  activeTab,
  guestRules,
}: RegistrationProps) {
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
          <div className="flex-1 space-y-6 py-4 md:space-y-10">
            <div>
              <div className="mb-3 flex items-center gap-3 md:mb-4">
                <div className="bg-halal-primary/30 h-px w-12" />
                <span className="text-halal-primary text-[10px] font-black tracking-[0.5em] uppercase">
                  CATEGORY
                </span>
              </div>
              <h2 className="font-outfit mb-4 text-4xl font-black tracking-tight text-white uppercase md:text-6xl">
                {type === 'external' ? 'DAFTAR ' : 'BOOTH '}
                <span className="text-halal-primary">
                  {type === 'external' ? 'UMUM' : 'UMKM'}
                </span>
              </h2>
              <p className="max-w-md text-base leading-relaxed text-zinc-400 md:text-lg">
                {type === 'external'
                  ? 'Registrasi masyarakat umum untuk menghadiri konser akbar.'
                  : 'Dapatkan kesempatan ekspansi bisnis dan jangkau ribuan pengunjung di lokasi acara.'}
              </p>

              {/* Open Gate Info */}
              {guestRules?.find((r) => r.guest_type === type) && (
                <div className="border-halal-primary/20 bg-halal-primary/5 mt-8 flex items-center gap-4 rounded-2xl border p-5 backdrop-blur-xl md:mt-12">
                  <div className="bg-halal-primary/20 text-halal-primary flex h-12 w-12 items-center justify-center rounded-xl shadow-inner">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-halal-primary block text-[10px] font-black tracking-[0.3em] uppercase opacity-70">
                      OPEN GATE
                    </span>
                    <p className="text-xl font-bold text-white md:text-2xl">
                      {guestRules
                        ?.find((r) => r.guest_type === type)
                        ?.open_gate?.substring(0, 5)
                        .replace(':', '.') || '--.--'}{' '}
                      WIB
                    </p>
                  </div>
                </div>
              )}
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
                    <div className="bg-halal-primary/20 text-halal-primary flex h-8 w-8 items-center justify-center rounded-full">
                      <div className="bg-halal-primary h-1 w-1 rounded-full" />
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
          <div className="w-full rounded-[2.5rem] border border-white/5 bg-[#0a1212] p-6 shadow-2xl md:w-[480px] md:p-10">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-10">
              <div>
                <h3 className="text-xl font-black tracking-tight text-white uppercase md:text-2xl">
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
                className="text-halal-primary h-auto p-0 text-[10px] font-black tracking-[0.2em] uppercase hover:text-white sm:text-right"
              >
                {authMode === 'register' ? 'Sudah Daftar?' : 'Belum Daftar?'}
              </Button>
            </div>

            {authMode === 'register' ? (
              <RegistrationForm
                eventIdentifier={eventId}
                forcedGuestType={type}
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
          <h2 className="font-outfit text-4xl font-black tracking-tighter text-white uppercase md:text-6xl">
            RESERVASI <span className="text-halal-primary">TEMPAT</span>
          </h2>
          <p className="mx-auto max-w-xl text-zinc-400">
            Pilih kategori pendaftaran Anda dan dapatkan akses eksklusif ke
            malam silaturahmi akbar tahun ini.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d1f1e]/60 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl md:p-12 lg:p-16">
          {renderAuthContent(activeTab)}

          <div className="mt-12 border-t border-white/5 pt-8 text-center">
            <p className="mb-4 text-sm text-zinc-500">
              Ingin mendaftar sebagai tenant atau booth UMKM?
            </p>
            <Link
              href={`/register/${eventId}/tenant`}
              className="text-halal-primary group inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase hover:underline"
            >
              Klik di sini untuk Pendaftaran Tenant
              <span className="transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
