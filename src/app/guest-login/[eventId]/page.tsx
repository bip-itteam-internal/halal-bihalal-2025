'use client'

import { useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Loader2,
  Phone,
  Mail,
  ArrowRight,
  User,
} from 'lucide-react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { motion, AnimatePresence } from 'framer-motion'
import { Particles } from '@/components/ui/particles'
import { buildInvitePath } from '@/lib/event-identifiers'

const loginSchema = z.object({
  identifier: z.string().min(3, 'Nomor WhatsApp atau Email tidak valid.'),
})

type GuestLoginValues = z.infer<typeof loginSchema>

interface GuestLoginPageProps {
  params: Promise<{ eventId: string }>
}

function getGuestRedirectPath(invitationCode: string, eventId: string) {
  return buildInvitePath(invitationCode, eventId)
}

export default function GuestLoginPage({ params }: GuestLoginPageProps) {
  const { eventId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const forcedGuestType =
    searchParams.get('type') === 'internal'
      ? 'internal'
      : searchParams.get('type') === 'tenant'
        ? 'tenant'
        : searchParams.get('type') === 'external'
          ? 'external'
          : null

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<GuestLoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
    },
  })

  const handleSubmit = async (values: GuestLoginValues) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/guest-login/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          guest_type: forcedGuestType || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Data tamu tidak valid.')
      }

      router.push(getGuestRedirectPath(data.invitation_code, eventId))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="theme-halal relative min-h-screen overflow-hidden">
      {/* Background Layer */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="bg-halal-secondary-dark absolute inset-0" />
        <Particles count={25} colors={['#dfae46', '#d97706']} />

        {/* Cinematic Overlays */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/islamic-exercise.png")`,
            backgroundSize: '400px',
          }}
        />

        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] animate-pulse rounded-full bg-[#F6E8CD]/40 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[60%] w-[60%] rounded-full bg-[#F6E8CD]/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 md:px-6">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-white/20 bg-white/5 py-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] backdrop-blur-3xl">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Left Section: Event Poster */}
                  <div className="flex-none bg-[#0a0a0a] lg:w-[420px]">
                    <Image
                      src="/fix.jpeg"
                      alt="Event Poster"
                      width={600}
                      height={800}
                      className="h-auto w-full object-contain lg:h-full"
                      priority
                    />
                  </div>

                  {/* Right Section: Login Form */}
                  <div className="relative flex flex-1 flex-col justify-center overflow-hidden border-l border-white/10 bg-gradient-to-br from-[#F6E8CD]/80 via-[#F6E8CD]/60 to-[#F6E8CD]/40 p-8 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)] backdrop-blur-2xl lg:p-14">
                    <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/glass-shattering.png')] opacity-[0.05]" />
                    <div className="relative">
                      <CardTitle className="font-outfit mb-2 text-2xl font-black text-slate-900">
                        Konfirmasi Kehadiran
                      </CardTitle>
                      <CardDescription className="font-medium text-slate-700">
                        {forcedGuestType === 'internal'
                          ? 'Silakan masukkan kontak tamu internal yang telah didaftarkan.'
                          : forcedGuestType === 'tenant'
                            ? 'Silakan masukkan kontak tenant yang telah didaftarkan.'
                            : forcedGuestType === 'external'
                              ? 'Masukkan nomor WhatsApp, Email, atau Nama Lengkap yang sudah terdaftar.'
                              : 'Masukkan nomor WhatsApp, Email, atau Nama Lengkap yang sudah terdaftar.'}
                      </CardDescription>
                    </div>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6"
                      >
                        <AnimatePresence mode="wait">
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <Alert
                                variant="destructive"
                                className="border-red-500/50 bg-red-500/10 text-red-200"
                              >
                                <AlertTitle className="text-sm font-bold">
                                  Login Gagal
                                </AlertTitle>
                                <AlertDescription className="text-xs opacity-90">
                                  {error}
                                </AlertDescription>
                              </Alert>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <FormField
                          control={form.control}
                          name="identifier"
                          render={({ field }) => {
                            const isEmailInput = field.value?.includes('@')
                            return (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-bold text-slate-900">
                                  WhatsApp, Email, atau Nama Lengkap
                                </FormLabel>
                                <FormControl>
                                  <div className="group relative">
                                    {isEmailInput ? (
                                      <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-amber-500/70 transition-colors group-focus-within:text-amber-500" />
                                    ) : field.value?.match(/^[0-9]+$/) ? (
                                      <Phone className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-amber-500/70 transition-colors group-focus-within:text-amber-500" />
                                    ) : (
                                      <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-amber-500/70 transition-colors group-focus-within:text-amber-500" />
                                    )}
                                    <Input
                                      placeholder="No. WA, Email, atau Nama Lengkap"
                                      required
                                      className="h-14 rounded-xl border-white/10 bg-white/10 pl-12 transition-all placeholder:text-white/30 focus:border-amber-400/50"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs text-red-400" />
                              </FormItem>
                            )
                          }}
                        />

                        <Button
                          type="submit"
                          className="bg-halal-primary text-halal-secondary hover:bg-halal-primary/90 h-12 w-full rounded-xl font-bold tracking-wider shadow-[0_10px_20px_rgba(223,174,70,0.15)] transition-all active:scale-[0.98]"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Memverifikasi...
                            </>
                          ) : (
                            <>
                              Masuk
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-white/40"
          >
            © {new Date().getFullYear()} Bharata Event. All rights reserved.
          </motion.p>
        </div>
      </div>
    </div>
  )
}
