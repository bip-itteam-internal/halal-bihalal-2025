'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import slugify from 'slugify'
import { MoveLeft, Ticket, Music } from 'lucide-react'
import { Event } from '@/types'
import { buildInvitePath } from '@/lib/event-identifiers'
import { Button } from '@/components/ui/button'
import { RegistrationForm } from '@/components/modules/register/registration-form'
import { GuestLoginForm } from '@/components/modules/auth/guest-login-form'
import { motion } from 'framer-motion'

type EksternalRegisterClientProps = {
  eventIdentifier: string
  event: Event
}

export function EksternalRegisterClient({
  eventIdentifier,
  event,
}: EksternalRegisterClientProps) {
  const router = useRouter()

  const [authMode, setAuthMode] = useState<'register' | 'login'>('register')

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a1b1a] px-4 py-12">
      {/* Modern Islamic Pattern Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/islamic-exercise.png")`,
          backgroundSize: '400px',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="link"
            className="gap-2 p-0 text-zinc-500 transition-colors hover:text-white"
            onClick={() => router.back()}
          >
            <MoveLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          {/* Left Column - Info & Benefit */}
          <div className="space-y-10 py-4">
            <div>
              <h1 className="mb-6 text-5xl leading-none font-black tracking-tight text-white uppercase md:text-6xl">
                REGISTRASI
                <br />
                <span className="text-halal-primary">PESERTA UMUM</span>
              </h1>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">
                Fasilitas yang Didapat
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { label: 'Tiket Konser GRATIS', icon: Ticket },
                  { label: 'Hiburan Musik', icon: Music },
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="bg-halal-primary/10 text-halal-primary flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:scale-110">
                      <benefit.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold tracking-wide text-zinc-300 uppercase">
                      {benefit.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="border-halal-primary/10 bg-halal-primary/5 rounded-2xl border p-6">
              <h4 className="text-halal-primary mb-2 flex items-center gap-2 text-sm font-bold uppercase">
                Informasi Penting
              </h4>
              <p className="text-xs leading-relaxed text-zinc-500">
                Satu akun dapat digunakan untuk mendaftarkan beberapa anggota
                keluarga atau kerabat. Pastikan data yang dimasukkan sesuai
                dengan identitas diri Anda.
              </p>
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
                eventIdentifier={eventIdentifier}
                forcedGuestType="external"
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
                guestType="external"
                hideHeader
              />
            )}

            <div className="mt-8 border-t border-white/5 pt-6 text-center">
              <p className="mb-2 text-[10px] tracking-widest text-zinc-500 uppercase">
                Ingin mendaftar sebagai tenant?
              </p>
              <Button
                variant="link"
                className="text-halal-primary h-auto p-0 text-[10px] font-black tracking-[0.2em] uppercase hover:text-white"
                onClick={() =>
                  router.push(
                    `/register/${slugify(event.name || '', { lower: true, strict: true })}/tenant`,
                  )
                }
              >
                Pendaftaran Booth UMKM &rarr;
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
