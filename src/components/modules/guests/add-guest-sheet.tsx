'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { generateRandomCode } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const guestSchema = z.object({
  full_name: z.string().min(3, 'Nama lengkap wajib diisi (min 3 karakter)'),
  guest_type: z.enum(['internal', 'external', 'tenant']),
  phone: z.string().optional(),
  email: z
    .string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  metadata: z.any().optional(),
})

type GuestFormValues = z.infer<typeof guestSchema>

interface AddGuestSheetProps {
  eventId: string
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddGuestSheet({
  eventId,
  onSuccess,
  trigger,
}: AddGuestSheetProps) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      full_name: '',
      guest_type: 'internal',
      phone: '',
      email: '',
      address: '',
    },
  })

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset()
    }
  }

  const onSubmit = async (values: GuestFormValues) => {
    try {
      setIsSubmitting(true)

      const { error } = await supabase.from('guests').insert([
        {
          event_id: eventId,
          full_name: values.full_name,
          guest_type: values.guest_type,
          phone: values.phone || null,
          email: values.email || null,
          address: values.address || null,
          metadata: values.metadata || {},
          registration_source: 'admin_invite',
          rsvp_status: 'pending',
          invitation_code: `INV-${generateRandomCode(6)}`,
          bracelet_code: `BRC-${generateRandomCode(6)}`,
        },
      ])

      if (error) throw error

      setIsOpen(false)
      form.reset()
      toast.success('Tamu berhasil ditambahkan.')
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem yang tidak diketahui',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tamu
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex w-[400px] flex-col p-0 sm:max-w-[450px]">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>Tambah Tamu Baru</SheetTitle>
          <SheetDescription>
            Masukkan detail tamu untuk diundang ke acara ini.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 py-4"
            >
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Lengkap <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="cth. Budi Santoso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guest_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipe Tamu <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe tamu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="internal">
                          Internal (Pegawai)
                        </SelectItem>
                        <SelectItem value="external">
                          Eksternal (Tamu Umum)
                        </SelectItem>
                        <SelectItem value="tenant">
                          Tenant (Vendor/UMKM)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="cth. 08123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="cth. budi@example.com" {...field} />
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
                    <FormLabel>Alamat / Instansi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alamat atau nama instansi tamu..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('guest_type') === 'tenant' && (
                <div className="space-y-3 rounded-lg border border-purple-100 bg-purple-50 p-4">
                  <p className="text-xs font-semibold tracking-wider text-purple-700 uppercase">
                    Informasi Tenant
                  </p>
                  <FormItem>
                    <FormLabel className="text-purple-900">
                      Nama Produk / Usaha
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="cth. Kopi Kenangan"
                        onChange={(e) => {
                          const metadata = form.getValues().metadata || {}
                          form.setValue('metadata', {
                            ...metadata,
                            umkm_product: e.target.value,
                          })
                        }}
                      />
                    </FormControl>
                  </FormItem>
                </div>
              )}
            </form>
          </Form>
        </div>

        <div className="mt-auto border-t p-6">
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Tamu'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
