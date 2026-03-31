'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  guest_type: z.enum(['internal', 'external']),
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

  // Event Selection state
  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true)
      const { data, error } = await supabase
        .from('events')
        .select('id, name')
        .order('created_at', { ascending: false })
      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset()
      setSelectedEventIds([])
    } else if (!eventId) {
      fetchEvents()
    }
  }

  const onSubmit = async (values: GuestFormValues) => {
    try {
      setIsSubmitting(true)

      // 1. Insert into Master Guest list
      const { data: newGuest, error: guestError } = await supabase
        .from('guests')
        .insert([
          {
            full_name: values.full_name,
            guest_type: values.guest_type,
            phone: values.phone || null,
            email: values.email || null,
            address: values.address || null,
            metadata: values.metadata || {},
            registration_source: 'admin_invite',
            rsvp_status: 'pending',
            invitation_code: `INV-${generateRandomCode(6)}`,
          },
        ])
        .select()
        .single()

      if (guestError) throw guestError

      // 2. If called from an event page or events are selected, assign them
      const targetEventIds = eventId ? [eventId] : selectedEventIds

      if (targetEventIds.length > 0) {
        const mappings = targetEventIds
          .filter((id) => id !== 'none')
          .map((eid) => ({
            guest_id: newGuest.id,
            event_id: eid,
          }))

        if (mappings.length > 0) {
          const { error: eventError } = await supabase
            .from('guest_events')
            .insert(mappings)

          if (eventError) throw eventError
        }
      }

      setIsOpen(false)
      form.reset()
      toast.success(
        eventId
          ? 'Tamu berhasil ditambahkan ke acara.'
          : 'Tamu berhasil ditambahkan ke Master.',
      )
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!eventId && (
                <div className="space-y-3 rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-bold text-amber-900">
                      Target Acara (Multi-Select)
                    </FormLabel>
                    {selectedEventIds.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-200 text-[9px] text-amber-900"
                      >
                        {selectedEventIds.length} dipilih
                      </Badge>
                    )}
                  </div>

                  <div className="max-h-[150px] space-y-1 overflow-y-auto rounded-md border border-amber-200 bg-white/50 p-2">
                    {loadingEvents ? (
                      <div className="flex h-10 items-center justify-center gap-2 text-[10px] text-amber-700">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Memuat acara...
                      </div>
                    ) : (
                      events.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => {
                            const isSelected = selectedEventIds.includes(ev.id)
                            if (isSelected) {
                              setSelectedEventIds((prev) =>
                                prev.filter((id) => id !== ev.id),
                              )
                            } else {
                              setSelectedEventIds((prev) => [...prev, ev.id])
                            }
                          }}
                          className={`flex cursor-pointer items-center gap-2 rounded p-1.5 transition-colors hover:bg-amber-100/50 ${
                            selectedEventIds.includes(ev.id)
                              ? 'bg-amber-100'
                              : ''
                          }`}
                        >
                          <div
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded border border-amber-400 ${
                              selectedEventIds.includes(ev.id)
                                ? 'bg-amber-600'
                                : 'bg-white'
                            }`}
                          >
                            {selectedEventIds.includes(ev.id) && (
                              <svg
                                className="h-2.5 w-2.5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={4}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-amber-900">
                            {ev.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-[9px] text-amber-700 italic">
                    Tamu akan otomatis terdaftar di semua acara yang dicentang.
                  </p>
                </div>
              )}

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
