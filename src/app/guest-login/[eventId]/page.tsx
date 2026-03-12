'use client'

import { useState, use, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  MoveLeft,
  Loader2,
  CalendarDays,
  MapPin,
  Ticket,
  Phone,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatJakartaDate } from '@/lib/utils'
import { Event } from '@/types'
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

const loginSchema = z.object({
  phone: z
    .string()
    .min(8, 'Nomor WhatsApp tidak valid.')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor WhatsApp tidak valid.'),
})

type GuestLoginValues = z.infer<typeof loginSchema>

interface GuestLoginPageProps {
  params: Promise<{ eventId: string }>
}

function getGuestRedirectPath(guestId: string, eventId: string) {
  return `/invite/${guestId}-${eventId}`
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
  const [event, setEvent] = useState<Event | null>(null)

  const form = useForm<GuestLoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
    },
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/register/${eventId}`)
        if (res.ok) {
          const data = await res.json()
          setEvent(data)
        }
      } catch (err) {
        console.error('Failed to fetch event:', err)
      }
    }
    fetchEvent()
  }, [eventId])

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

      router.push(getGuestRedirectPath(data.guest_id, eventId))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="theme-halal bg-halal-secondary selection:bg-halal-primary relative min-h-screen overflow-hidden selection:text-black">
      {/* Background Layer */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1b1a]" />
        <Particles count={30} />

        {/* Cinematic Overlays */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/islamic-exercise.png")`,
            backgroundSize: '400px',
          }}
        />

        {/* Glow Effects */}
        <div className="bg-halal-primary/10 absolute top-[-10%] left-[-10%] h-[60%] w-[60%] animate-pulse rounded-full blur-[120px]" />
        <div className="bg-halal-accent/20 absolute right-[-10%] bottom-[-10%] h-[60%] w-[60%] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 md:px-6">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="inline-flex">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-halal-primary/10 border-halal-primary/30 text-halal-primary rounded-full bg-black/40 backdrop-blur-md transition-all"
              >
                <MoveLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-dark overflow-hidden border-white/5 py-0 shadow-2xl">
              <CardContent className="p-0">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
                  {/* Left Section: Event Preview */}
                  <div className="bg-halal-accent/30 flex flex-col justify-center border-b border-white/5 p-8 lg:border-r lg:border-b-0">
                    <div className="space-y-2">
                      <div className="relative mx-auto h-40 w-full max-w-[280px] overflow-hidden md:h-56 md:max-w-[380px]">
                        {event?.logo_url ? (
                          <Image
                            src={event.logo_url}
                            alt={event?.name || 'Event Logo'}
                            fill
                            sizes="(max-width: 768px) 240px, 320px"
                            className="object-contain"
                            priority
                          />
                        ) : (
                          <div className="bg-halal-secondary flex h-full w-full items-center justify-center">
                            <Ticket className="text-halal-primary/40 h-20 w-20" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 text-center">
                        <h1 className="font-outfit text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
                          {event?.name || 'Login Tamu'}
                        </h1>

                        <div className="space-y-3">
                          {event?.event_date && (
                            <div className="flex items-center justify-center gap-3 text-sm text-slate-300">
                              <CalendarDays className="text-halal-primary h-4 w-4" />
                              <span>
                                {formatJakartaDate(event.event_date, 'PPPP')}
                              </span>
                            </div>
                          )}
                          {event?.location && (
                            <div className="flex items-center justify-center gap-3 text-sm text-slate-300">
                              <MapPin className="text-halal-primary h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Login Form */}
                  <div className="flex flex-col justify-center bg-black/20 p-8 lg:p-10">
                    <div className="mb-8">
                      <CardTitle className="font-outfit mb-2 text-xl font-bold text-white">
                        Konfirmasi Kehadiran
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {forcedGuestType === 'internal'
                          ? 'Silahakan masukkan nomor WhatsApp tamu internal yang telah didaftarkan.'
                          : forcedGuestType === 'tenant'
                            ? 'Silahakan masukkan nomor WhatsApp tenant yang telah didaftarkan.'
                            : forcedGuestType === 'external'
                              ? 'Silahakan masukkan nomor WhatsApp tamu umum yang telah didaftarkan.'
                              : 'Masukkan nomor WhatsApp yang sudah terdaftar di daftar tamu.'}
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
                          name="phone"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-sm font-medium text-slate-300">
                                Nomor WhatsApp
                              </FormLabel>
                              <FormControl>
                                <div className="group relative">
                                  <Phone className="text-halal-primary/50 group-focus-within:text-halal-primary absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transition-colors" />
                                  <Input
                                    type="tel"
                                    placeholder="08123456789"
                                    required
                                    className="border-halal-primary/20 focus:border-halal-primary/50 h-12 rounded-xl bg-black/40 pl-12 text-white transition-all placeholder:text-slate-600"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-red-400" />
                            </FormItem>
                          )}
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
            className="text-center text-xs text-slate-500"
          >
            © {new Date().getFullYear()} Bharata Event. All rights reserved.
          </motion.p>
        </div>
      </div>
    </div>
  )
}
