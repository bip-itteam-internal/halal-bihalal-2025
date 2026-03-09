'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
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

      const data = await registerGuest(eventIdentifier, {
        full_name: values.full_name,
        phone: values.phone,
        guest_type: registrationType,
        address: cleanedAddress,
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
                      placeholder="Contoh: Kopi, Kerajinan, Makanan Ringan"
                      className="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus:border-amber-500/50"
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
            className="bg-halal-primary hover:bg-halal-primary/90 w-full font-bold text-black"
            disabled={registerLoading}
          >
            {registerLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
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
