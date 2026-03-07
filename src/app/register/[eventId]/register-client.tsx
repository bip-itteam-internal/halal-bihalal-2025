'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoveLeft,
  CheckCircle2,
  Ticket,
  Printer,
  Loader2,
  CalendarDays,
  MapPin,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatJakartaDate } from '@/lib/utils'
import { Event } from '@/types'
import QRCode from 'react-qr-code'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const registrationSchema = z.object({
  full_name: z.string().min(3, 'Nama minimal 3 karakter.'),
  phone: z
    .string()
    .min(8, 'Nomor WhatsApp tidak valid.')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor WhatsApp tidak valid.'),
  address: z.string().optional(),
  umkm_product: z.string().optional(),
})

type RegistrationFormValues = z.infer<typeof registrationSchema>
const guestLoginSchema = z.object({
  phone: z
    .string()
    .min(8, 'Nomor WhatsApp tidak valid.')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor WhatsApp tidak valid.'),
})
type GuestLoginValues = z.infer<typeof guestLoginSchema>
const RequiredMark = () => <span className="text-red-500"> *</span>

type RegisterEventClientProps = {
  eventIdentifier: string
  event: Event
  initialType: 'external' | 'tenant' | null
}

export function RegisterEventClient({
  eventIdentifier,
  event,
  initialType,
}: RegisterEventClientProps) {
  const router = useRouter()
  const forcedGuestType = initialType

  const [registerLoading, setRegisterLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [guestId, setGuestId] = useState('')
  const [registeredName, setRegisteredName] = useState('')
  const [registeredGuestType, setRegisteredGuestType] = useState<
    'external' | 'tenant'
  >(initialType === 'tenant' ? 'tenant' : 'external')
  const [registerError, setRegisterError] = useState('')
  const [loginError, setLoginError] = useState('')
  const [registrationType, setRegistrationType] = useState<
    'external' | 'tenant'
  >(initialType === 'tenant' ? 'tenant' : 'external')
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register')

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      address: '',
      umkm_product: '',
    },
  })

  const loginForm = useForm<GuestLoginValues>({
    resolver: zodResolver(guestLoginSchema),
    defaultValues: {
      phone: '',
    },
  })

  const handleSubmit = async (values: RegistrationFormValues) => {
    form.clearErrors()
    setRegisterLoading(true)
    setRegisterError('')

    try {
      const cleanedAddress = values.address?.trim() || ''
      const cleanedUmkmProduct = values.umkm_product?.trim() || ''

      if (registrationType === 'tenant') {
        let hasValidationError = false

        if (!cleanedAddress) {
          form.setError('address', {
            type: 'manual',
            message: 'Alamat tenant wajib diisi.',
          })
          hasValidationError = true
        }

        if (!cleanedUmkmProduct) {
          form.setError('umkm_product', {
            type: 'manual',
            message: 'Produk UMKM wajib diisi.',
          })
          hasValidationError = true
        }

        if (hasValidationError) {
          setRegisterLoading(false)
          return
        }
      }

      if (!cleanedAddress) {
        form.setError('address', {
          type: 'manual',
          message:
            registrationType === 'tenant'
              ? 'Alamat tenant wajib diisi.'
              : 'Alamat wajib diisi.',
        })
        setRegisterLoading(false)
        return
      }

      const res = await fetch(`/api/register/${eventIdentifier}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: values.full_name,
          phone: values.phone,
          guest_type: registrationType,
          address: cleanedAddress,
          metadata:
            registrationType === 'tenant'
              ? { umkm_product: cleanedUmkmProduct }
              : {},
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      setGuestId(data.guest_id)
      setRegisteredName(values.full_name)
      setRegisteredGuestType(registrationType)
      setSuccess(true)
    } catch (err: unknown) {
      setRegisterError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem',
      )
    } finally {
      setRegisterLoading(false)
    }
  }

  function getGuestRedirectPath(guestId: string, guestType?: string) {
    switch (guestType) {
      case 'internal':
      case 'external':
      case 'tenant':
      default:
        return `/invite/${guestId}`
    }
  }

  const handleGuestLogin = async (values: GuestLoginValues) => {
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch(`/api/guest-login/${eventIdentifier}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: values.phone,
          guest_type: forcedGuestType || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Nomor WhatsApp tidak ditemukan.')
      }
      router.push(getGuestRedirectPath(data.guest_id, data.guest_type))
    } catch (err: unknown) {
      setLoginError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem',
      )
    } finally {
      setLoginLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-muted/40 min-h-screen px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl">Pendaftaran Berhasil</CardTitle>
              <CardDescription>
                Simpan QR code ini untuk proses check-in di lokasi acara.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-background rounded-lg border p-4">
                <div className="mx-auto flex w-fit items-center justify-center rounded-md bg-white p-2">
                  <QRCode value={guestId} size={210} viewBox="0 0 256 256" />
                </div>
              </div>

              <div className="bg-muted/40 space-y-3 rounded-lg border p-4">
                <div className="text-muted-foreground text-xs">Nama Tamu</div>
                <div className="text-base font-semibold">{registeredName}</div>
                <div className="flex items-center justify-between border-t pt-3">
                  <Badge variant="secondary">
                    {registeredGuestType === 'tenant' ? 'TENANT' : 'EKSTERNAL'}
                  </Badge>
                  <span className="text-muted-foreground font-mono text-xs">
                    {guestId.split('-')[0]}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Cetak / Simpan Tiket
              </Button>
              <Link href="/eksternal" className="w-full">
                <Button variant="outline" className="w-full">
                  Kembali ke Beranda
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted/40 min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <Link href="/eksternal" className="inline-flex">
          <Button variant="outline" size="icon" aria-label="Kembali">
            <MoveLeft className="h-4 w-4" />
          </Button>
        </Link>

        <Card>
          <CardContent className="p-5 md:p-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <div className="space-y-5">
                <div className="bg-muted relative mx-auto w-full overflow-hidden rounded-lg border lg:mx-0 lg:max-w-[260px]">
                  <div className="relative aspect-[1/1] w-full">
                    {event?.logo_url ? (
                      <Image
                        src={event.logo_url}
                        alt={`Poster ${event?.name || 'event'}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain p-5"
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
                    {event?.name || 'Registrasi Event'}
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
                  <CardTitle className="text-xl">Form Pendaftaran</CardTitle>
                  <CardDescription>
                    {forcedGuestType === 'tenant'
                      ? 'Akses khusus tenant: register dan login tenant.'
                      : forcedGuestType === 'external'
                        ? 'Akses khusus umum: register dan login tamu umum.'
                        : 'Pilih mode register atau login tamu.'}
                  </CardDescription>
                </div>

                <div className="bg-muted grid grid-cols-2 gap-2 rounded-lg p-1">
                  <Button
                    type="button"
                    variant={activeTab === 'register' ? 'default' : 'ghost'}
                    className="h-9"
                    onClick={() => setActiveTab('register')}
                  >
                    Register
                  </Button>
                  <Button
                    type="button"
                    variant={activeTab === 'login' ? 'default' : 'ghost'}
                    className="h-9"
                    onClick={() => setActiveTab('login')}
                  >
                    Login
                  </Button>
                </div>

                {activeTab === 'register' ? (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSubmit)}
                      className="space-y-5"
                    >
                      {registerError && (
                        <Alert variant="destructive">
                          <AlertTitle>Pendaftaran Gagal</AlertTitle>
                          <AlertDescription>{registerError}</AlertDescription>
                        </Alert>
                      )}

                      {!forcedGuestType && (
                        <div className="bg-muted grid grid-cols-2 gap-2 rounded-lg p-1">
                          <Button
                            type="button"
                            variant={
                              registrationType === 'external'
                                ? 'default'
                                : 'ghost'
                            }
                            className="h-9"
                            onClick={() => setRegistrationType('external')}
                          >
                            Umum / Eksternal
                          </Button>
                          <Button
                            type="button"
                            variant={
                              registrationType === 'tenant'
                                ? 'default'
                                : 'ghost'
                            }
                            className="h-9"
                            onClick={() => setRegistrationType('tenant')}
                          >
                            Tenant
                          </Button>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {registrationType === 'tenant'
                                ? 'Nama PIC Tenant'
                                : 'Nama Lengkap'}
                              <RequiredMark />
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  registrationType === 'tenant'
                                    ? 'Masukkan nama PIC tenant'
                                    : 'Masukkan nama lengkap'
                                }
                                required
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Nomor WhatsApp
                              <RequiredMark />
                            </FormLabel>
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

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {registrationType === 'tenant'
                                ? 'Alamat Tenant'
                                : 'Alamat'}
                              <RequiredMark />
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={
                                  registrationType === 'tenant'
                                    ? 'Masukkan alamat tenant'
                                    : 'Contoh: Jl. Merdeka No. 1, Cipari'
                                }
                                className="min-h-24"
                                required
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {registrationType === 'tenant' && (
                        <FormField
                          control={form.control}
                          name="umkm_product"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Produk UMKM
                                <RequiredMark />
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Contoh: Kopi, Kerajinan, Makanan Ringan"
                                  required
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerLoading}
                      >
                        {registerLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          'Daftar Sekarang'
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(handleGuestLogin)}
                      className="space-y-5"
                    >
                      {forcedGuestType && (
                        <p className="text-muted-foreground text-sm">
                          Login khusus{' '}
                          {forcedGuestType === 'tenant' ? 'tenant' : 'umum'}.
                        </p>
                      )}
                      {loginError && (
                        <Alert variant="destructive">
                          <AlertTitle>Login Gagal</AlertTitle>
                          <AlertDescription>{loginError}</AlertDescription>
                        </Alert>
                      )}
                      <FormField
                        control={loginForm.control}
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
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginLoading}
                      >
                        {loginLoading ? (
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
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
