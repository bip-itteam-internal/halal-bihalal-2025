'use client'

import React, { useState } from 'react'
import {
  Loader2,
  Upload,
  Receipt,
  Info,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { registerGuest } from '@/services/api/registration'
import { cn } from '@/lib/utils'

export const registrationSchema = z.object({
  full_name: z.string().min(3, 'Nama minimal 3 karakter.'),
  phone: z
    .string()
    .min(8, 'Nomor WhatsApp tidak valid.')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor WhatsApp tidak valid.'),
  address: z.string().optional(),
  umkm_product: z.string().optional(),
})

export type RegistrationFormValues = z.infer<typeof registrationSchema>

const RequiredMark = () => <span className="text-red-500"> *</span>

interface RegistrationFormProps {
  eventIdentifier: string
  forcedGuestType: 'external' | 'tenant' | null
  onSuccess: (data: {
    guest_id: string
    qr_payload: string
    registeredName: string
    registrationType: 'external' | 'tenant'
  }) => void
  hideHeader?: boolean
}

export function RegistrationForm({
  eventIdentifier,
  forcedGuestType,
  onSuccess,
  hideHeader = false,
}: RegistrationFormProps) {
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registrationType, setRegistrationType] = useState<
    'external' | 'tenant'
  >(forcedGuestType === 'tenant' ? 'tenant' : 'external')
  const [eventData, setEventData] = useState<Event | null>(null)
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  React.useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/register/${eventIdentifier}`)
        if (res.ok) {
          const data = await res.json()
          setEventData(data)
        }
      } catch (err) {
        console.error('Failed to fetch event data:', err)
      }
    }
    fetchEvent()
  }, [eventIdentifier])

  const getPrice = () => {
    if (!eventData?.is_paid) return 0
    return registrationType === 'tenant'
      ? eventData.is_tenant_paid
        ? 1
        : 0 // Dummy price to trigger payment UI if is_tenant_paid is true
      : eventData.price_external || 0
  }

  const price = getPrice()
  const isPaid =
    registrationType === 'tenant'
      ? eventData?.is_tenant_paid
      : eventData?.is_paid && (eventData.price_external || 0) > 0

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      address: '',
      umkm_product: '',
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
      } else if (!cleanedAddress) {
        form.setError('address', {
          type: 'manual',
          message: 'Alamat wajib diisi.',
        })
        setRegisterLoading(false)
        return
      }

      let paymentProofUrl = ''
      if (isPaid) {
        if (!paymentFile) {
          setRegisterError('Bukti pembayaran wajib diunggah.')
          setRegisterLoading(false)
          return
        } else {
          setIsUploading(true)
          try {
            const fileExt = paymentFile.name.split('.').pop()
            const fileName = `${eventIdentifier}-${Date.now()}.${fileExt}`
            const filePath = `payment-proofs/${fileName}`
            const { error: uploadError } = await supabase.storage
              .from('event-assets')
              .upload(filePath, paymentFile)
            if (uploadError) throw uploadError
            const {
              data: { publicUrl },
            } = supabase.storage.from('event-assets').getPublicUrl(filePath)
            paymentProofUrl = publicUrl
          } catch (err) {
            console.error('Upload error:', err)
            setRegisterError('Gagal mengunggah bukti pembayaran.')
            setRegisterLoading(false)
            setIsUploading(false)
            return
          } finally {
            setIsUploading(false)
          }
        }
      }

      const data = await registerGuest(eventIdentifier, {
        full_name: values.full_name,
        phone: values.phone,
        guest_type: registrationType,
        address: cleanedAddress,
        payment_proof_url: paymentProofUrl,
        metadata:
          registrationType === 'tenant'
            ? { umkm_product: cleanedUmkmProduct }
            : {},
      })

      onSuccess({
        guest_id: data.guest_id,
        qr_payload: data.qr_payload || data.guest_id,
        registeredName: values.full_name,
        registrationType: registrationType,
      })
    } catch (err: unknown) {
      setRegisterError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem',
      )
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight text-white uppercase">
            Form <span className="text-amber-500">Pendaftaran</span>
          </h3>
          <p className="text-sm text-slate-400">
            {forcedGuestType === 'tenant'
              ? 'Silakan isi formulir pendaftaran untuk Booth UMKM.'
              : forcedGuestType === 'external'
                ? 'Silakan isi formulir pendaftaran untuk tamu umum.'
                : 'Silakan isi formulir pendaftaran di bawah ini.'}
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {registerError && (
            <Alert variant="destructive">
              <AlertTitle>Pendaftaran Gagal</AlertTitle>
              <AlertDescription>{registerError}</AlertDescription>
            </Alert>
          )}

          {!forcedGuestType && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/5 bg-black/40 p-1">
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'h-9 rounded-lg transition-all',
                  registrationType === 'external'
                    ? 'bg-amber-500 text-black hover:bg-amber-500 hover:text-black'
                    : 'text-slate-400 hover:text-white',
                )}
                onClick={() => setRegistrationType('external')}
              >
                Umum / Eksternal
              </Button>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'h-9 rounded-lg transition-all',
                  registrationType === 'tenant'
                    ? 'bg-amber-500 text-black hover:bg-amber-500 hover:text-black'
                    : 'text-slate-400 hover:text-white',
                )}
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
                <FormLabel className="text-zinc-300">
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
                    className="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus:border-amber-500/50"
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
                <FormLabel className="text-zinc-300">
                  Nomor WhatsApp
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="08123456789"
                    className="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus:border-amber-500/50"
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
                <FormLabel className="text-zinc-300">
                  {registrationType === 'tenant' ? 'Alamat Tenant' : 'Alamat'}
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      registrationType === 'tenant'
                        ? 'Masukkan alamat tenant'
                        : 'Contoh: Jl. Merdeka No. 1, Cipari'
                    }
                    className="min-h-24 border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus:border-amber-500/50"
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
                  <FormLabel className="text-zinc-300">
                    Produk UMKM
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Nasi Goreng, Es Campur"
                      className="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus:border-amber-500/50"
                      required
                      {...field}
                    />
                  </FormControl>
                  <p className="text-[10px] text-slate-500 italic">
                    * Khusus kategori F&B.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isPaid && (
            <div className="space-y-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-500/20 p-2 text-amber-500">
                  <Receipt className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold text-amber-500">
                    Informasi Pembayaran
                  </h4>
                  <p className="text-xs text-slate-300">
                    Pendaftaran untuk{' '}
                    {registrationType === 'tenant' ? 'Tenant' : 'Umum'}:
                  </p>
                  {registrationType === 'tenant' ? (
                    <div className="mt-1 flex flex-col gap-2">
                      <p className="text-lg font-black text-white italic underline decoration-amber-500 underline-offset-4">
                        Hubungi Panitia
                      </p>
                      <a
                        href={`https://wa.me/628123456789?text=Halo%20Admin,%20saya%20PIC%20Tenant%20tertarik%20mendaftar%20untuk%20event%20${eventData?.name || 'ini'}.%20Mohon%20info%20lebih%20lanjut.`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-500"
                      >
                        <MessageCircle className="h-3 w-3" /> CHAT WA
                      </a>
                    </div>
                  ) : (
                    <p className="text-lg font-black text-white">
                      Rp {price.toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              </div>

              {eventData?.payment_info && (
                <div className="rounded-lg bg-black/40 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-amber-500/80 uppercase">
                    <Info className="h-3 w-3" />
                    Instruksi Transfer
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-300 italic">
                    {eventData?.payment_info}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <FormLabel className="text-zinc-300">
                  Unggah Bukti Transfer
                  <RequiredMark />
                </FormLabel>
                <div
                  className={cn(
                    'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all',
                    paymentFile
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-white/10 bg-black/20 hover:border-amber-500/30',
                  )}
                  onClick={() =>
                    document.getElementById('payment-upload')?.click()
                  }
                >
                  <input
                    id="payment-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setPaymentFile(file)
                    }}
                  />
                  {paymentFile ? (
                    <div className="flex flex-col items-center gap-1 text-green-500">
                      <CheckCircle2 className="h-8 w-8" />
                      <span className="max-w-[200px] truncate text-[10px] font-medium">
                        {paymentFile.name}
                      </span>
                      <span className="text-[9px] text-zinc-400 opacity-70">
                        Klik untuk ganti file
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                      <Upload className="h-8 w-8 opacity-50" />
                      <span className="text-[10px] font-medium text-zinc-400">
                        Klik untuk upload bukti bayar
                      </span>
                      <span className="text-center text-[9px] opacity-50">
                        Format: JPG, PNG, Max 2MB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="bg-halal-primary hover:bg-halal-primary/90 w-full font-bold text-black"
            disabled={registerLoading || isUploading}
          >
            {registerLoading || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? 'Memproses File...' : 'Mendaftarkan...'}
              </>
            ) : (
              'Daftar Sekarang'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
