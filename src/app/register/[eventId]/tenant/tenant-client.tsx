'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import slugify from 'slugify'
import { motion } from 'framer-motion'
import { MoveLeft, Store, Star, MessageCircle, Info } from 'lucide-react'
import { Event } from '@/types'
import { buildInvitePath } from '@/lib/event-identifiers'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RegistrationForm } from '@/components/modules/register/registration-form'
import { GuestLoginForm } from '@/components/modules/auth/guest-login-form'
import { Particles, ShootingStars } from '@/components/ui/particles'

type TenantRegisterClientProps = {
  eventIdentifier: string
  event: Event
}

export function TenantRegisterClient({
  eventIdentifier,
  event,
}: TenantRegisterClientProps) {
  const router = useRouter()
  const authMode = 'register'
  const [paymentFile, setPaymentFile] = useState<File | null>(null)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a1b1a] px-4 py-12">
      {/* Background Particles & Stars */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Particles count={30} />
        <ShootingStars />
      </div>

      {/* Modern Islamic Pattern Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/islamic-exercise.png")`,
          backgroundSize: '400px',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-halal-primary/10 border-halal-primary/30 text-halal-primary rounded-full bg-black/40 backdrop-blur-md transition-all"
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          {/* Left Column - Info & Benefit */}
          <div className="space-y-10 py-4">
            <div>
              <h1 className="mb-6 text-5xl leading-none font-black tracking-tight text-white uppercase md:text-6xl">
                REGISTRASI
                <br />
                <span className="text-halal-primary uppercase">BOOTH UMKM</span>
              </h1>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">
                Fasilitas yang Didapat
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {['Stand', 'Akses Listrik', 'Tiket Konser'].map(
                  (benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                    >
                      <div className="bg-halal-primary/10 text-halal-primary flex h-8 w-8 items-center justify-center rounded-full">
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                      <span className="text-xs font-bold tracking-wide text-zinc-300 uppercase">
                        {benefit}
                      </span>
                    </motion.div>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="group rounded-3xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.03]">
                <div className="mb-6 space-y-2">
                  <div className="bg-halal-primary/10 text-halal-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase">
                    <Store className="h-3 w-3" /> Info Booth UMKM
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    Pendaftaran khusus tenant Food & Beverage. Informasi
                    pembayaran dan bantuan pendaftaran tersedia di bawah ini.
                  </p>
                </div>

                <Alert className="border-white/10 bg-black/40 backdrop-blur-sm">
                  <Info className="text-halal-primary h-4 w-4" />
                  <AlertTitle className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                    Metode Transfer
                  </AlertTitle>
                  <AlertDescription className="mt-2 text-slate-300">
                    <div className="font-mono text-[11px] leading-relaxed tracking-tight whitespace-pre-wrap">
                      {event.payment_info}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[9px] font-medium text-zinc-500 italic">
                      Silakan hubungi panitia jika ada kendala pembayaran.
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="mt-6">
                  <a
                    href="https://wa.me/6289676258026"
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-3.5 text-[10px] font-black tracking-[0.2em] text-white uppercase transition-all hover:scale-[1.02] hover:bg-emerald-400 hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4 fill-current" /> Hubungi
                    Panitia (Fariz)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0d1f1e] p-8 shadow-2xl md:p-10">
            <div className="bg-halal-primary/5 absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full blur-3xl" />

            <div className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white uppercase">
                  {authMode === 'register' ? 'FORM ' : 'AKSES '}
                  <span className="text-halal-primary">
                    {authMode === 'register' ? 'PENDAFTARAN' : 'UNDANGAN'}
                  </span>
                </h3>
                <div className="bg-halal-primary mt-2 h-1 w-12" />
              </div>
            </div>

            {authMode === 'register' ? (
              <RegistrationForm
                eventIdentifier={eventIdentifier}
                forcedGuestType="tenant"
                paymentFile={paymentFile}
                setPaymentFile={setPaymentFile}
                onSuccess={(data) => {
                  const eventSlug = slugify(event.name || event.id, {
                    lower: true,
                    strict: true,
                  })
                  router.push(buildInvitePath(data.invitation_code, eventSlug))
                }}
                hideHeader
              />
            ) : (
              <GuestLoginForm
                eventId={eventIdentifier}
                guestType="tenant"
                hideHeader
              />
            )}
            <div className="mt-8 flex justify-center border-t border-white/5 pt-6">
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  const eventSlug = slugify(event.name || event.id, {
                    lower: true,
                    strict: true,
                  })
                  router.push(`/tenant-login/${eventSlug}`)
                }}
                className="text-halal-primary h-auto p-0 text-[10px] font-black tracking-[0.2em] uppercase hover:text-white"
              >
                Sudah Daftar? Klik di sini untuk Masuk
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
