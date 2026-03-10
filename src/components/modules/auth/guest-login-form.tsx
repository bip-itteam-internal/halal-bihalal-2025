'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { loginGuest } from '@/services/api/auth'

const loginSchema = z.object({
  phone: z
    .string()
    .min(8, 'Nomor WhatsApp tidak valid.')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor WhatsApp tidak valid.'),
})

type GuestLoginValues = z.infer<typeof loginSchema>

interface GuestLoginFormProps {
  eventId: string
  guestType: 'internal' | 'tenant' | 'external'
  onSuccess?: () => void
  hideHeader?: boolean
}

export function GuestLoginForm({
  eventId,
  guestType,
  onSuccess,
  hideHeader = false,
}: GuestLoginFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<GuestLoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
    },
  })

  const handleSubmit = async (values: GuestLoginValues) => {
    setLoading(true)
    setError('')

    try {
      const data = await loginGuest(eventId, {
        ...values,
        guest_type: guestType,
      })

      if (onSuccess) onSuccess()
      router.push(`/invite/${data.guest_id}-${eventId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight text-white uppercase">
            Akses <span className="text-amber-500">Undangan</span>
          </h3>
          <p className="text-sm text-slate-400">
            Masukkan nomor WhatsApp yang terdaftar untuk mengakses tiket Anda.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="border-red-500/20 bg-red-500/10 text-red-400"
            >
              <AlertTitle>Login Gagal</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Nomor WhatsApp</FormLabel>
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

          <Button
            type="submit"
            className="bg-halal-primary w-full text-black hover:bg-halal-primary/80"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk Ke Undangan'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
