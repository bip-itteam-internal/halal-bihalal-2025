'use client'

import { useState, use, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MoveLeft, Loader2, CalendarDays, MapPin, Ticket } from 'lucide-react'
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

function getGuestRedirectPath(guestId: string, guestType?: string) {
  switch (guestType) {
    case 'internal':
      return `/invite/${guestId}`
    case 'external':
      return `/invite/${guestId}`
    case 'tenant':
      return `/invite/${guestId}`
    default:
      return `/invite/${guestId}`
  }
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

      router.push(getGuestRedirectPath(data.guest_id, data.guest_type))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-muted/40 min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <Link href="/" className="inline-flex">
          <Button variant="outline" size="icon" aria-label="Kembali">
            <MoveLeft className="h-4 w-4" />
          </Button>
        </Link>

        <Card>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <div className="space-y-5">
                <div className="bg-muted relative mx-auto w-full overflow-hidden rounded-lg border lg:mx-0 lg:max-w-[260px]">
                  <div className="relative aspect-[1/1] w-full">
                    {event?.logo_url ? (
                      <Image
                        src={event.logo_url}
                        alt={`Poster ${event?.name || 'event'}`}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                        <Ticket className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="line-clamp-3 text-2xl leading-tight font-bold md:text-3xl">
                    {event?.name || 'Login Tamu Event'}
                  </h1>
                </div>

                {event?.event_date && (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4" />
                    <span>{formatJakartaDate(event.event_date, 'PPP p')}</span>
                  </div>
                )}
                {event?.location && (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 lg:border-l lg:pl-6">
                <div>
                  <CardTitle className="text-xl">Login Tamu</CardTitle>
                  <CardDescription>
                    {forcedGuestType === 'internal'
                      ? 'Masukkan nomor WhatsApp tamu internal yang terdaftar.'
                      : forcedGuestType === 'tenant'
                        ? 'Masukkan nomor WhatsApp tenant yang terdaftar.'
                        : forcedGuestType === 'external'
                          ? 'Masukkan nomor WhatsApp tamu umum yang terdaftar.'
                          : 'Masukkan nomor WhatsApp yang sudah terdaftar di daftar tamu.'}
                  </CardDescription>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-5"
                  >
                    {error && (
                      <Alert variant="destructive">
                        <AlertTitle>Login Gagal</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor WhatsApp</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="08123456789"
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        'Masuk'
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
