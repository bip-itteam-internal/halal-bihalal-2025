'use client'

import { useState, useEffect } from 'react'
import { Loader2, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Guest } from '@/types'
import { updateGuestAction } from '@/app/actions/guest-actions'

const guestSchema = z.object({
  full_name: z.string().min(3, 'Nama lengkap wajib diisi (min 3 karakter)'),
  guest_type: z.enum(['internal', 'external']),
  phone: z.string().optional(),
  email: z
    .string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  registration_number: z.coerce.number().optional(),
  shirt_size: z.string().optional(),
  rsvp_status: z.enum(['pending', 'confirmed', 'declined']).optional(),
})

type GuestFormValues = z.infer<typeof guestSchema>

interface EditGuestDialogProps {
  guest: Guest | null
  eventId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditGuestDialog({
  guest,
  eventId,
  open,
  onOpenChange,
  onSuccess,
}: EditGuestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      full_name: '',
      guest_type: 'internal',
      phone: '',
      email: '',
      address: '',
      registration_number: undefined,
      shirt_size: '',
      rsvp_status: 'pending',
    },
  })

  useEffect(() => {
    if (guest && open) {
      form.reset({
        full_name: guest.full_name || '',
        guest_type: guest.guest_type as 'internal' | 'external',
        phone: guest.phone || '',
        email: guest.email || '',
        address: guest.address || '',
        registration_number: guest.registration_number || undefined,
        shirt_size: guest.shirt_size || '',
        rsvp_status: guest.rsvp_status || 'pending',
      })
    }
  }, [guest, open, form])

  const onSubmit = async (values: GuestFormValues) => {
    if (!guest) return

    try {
      setIsSubmitting(true)

      const normalizedPhone = values.phone ? values.phone.replace(/\D/g, '') : null

      const guestUpdates = {
        full_name: values.full_name,
        guest_type: values.guest_type,
        phone: normalizedPhone,
        email: values.email || null,
        address: values.address || null,
        shirt_size: values.shirt_size || null,
        rsvp_status: values.rsvp_status,
      }

      const eventUpdates = {
        registration_number: values.registration_number || null,
      }

      const res = await updateGuestAction(
        guest.id,
        guestUpdates,
        eventId,
        eventUpdates,
      )

      if (res.success) {
        toast.success(res.message)
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast.error(res.message)
      }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-indigo-600" />
            Edit Data Tamu
          </DialogTitle>
          <DialogDescription>
            Perbarui informasi detail untuk tamu {guest?.full_name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nama Lengkap</FormLabel>
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
                    <FormLabel>Tipe Tamu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe tamu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="external">Eksternal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rsvp_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status RSVP</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
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
                    <FormLabel>WhatsApp</FormLabel>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="cth. budi@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Urut</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="cth. 1"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shirt_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Baju</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih ukuran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Alamat / Instansi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alamat atau nama instansi..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
