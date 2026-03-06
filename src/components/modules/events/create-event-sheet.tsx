'use client'

import { useState } from 'react'
import { Plus, CalendarIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { cn, formatJakartaDate, getJakartaNow, toJakartaISOString } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const eventSchema = z.object({
  name: z.string().min(3, 'Nama event wajib diisi (min 3 karakter)'),
  event_type: z.enum(['internal', 'public']),
  description: z.string().optional(),
  event_date: z.date({
    required_error: 'Tanggal acara wajib diisi',
  }),
  event_time: z.string().optional().default('08:00'),
  location: z.string().optional(),
  dress_code: z.string().optional(),
  external_quota: z.coerce.number().optional().default(1000),
})

type EventFormValues = z.infer<typeof eventSchema>

interface CreateEventSheetProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function CreateEventSheet({
  onSuccess,
  trigger,
}: CreateEventSheetProps) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      event_type: 'internal',
      description: '',
      location: '',
      dress_code: '',
      external_quota: 1000,
      event_time: '08:00',
    },
  })

  // Set the default internal state after changing
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset()
    }
  }

  const onSubmit = async (values: EventFormValues) => {
    try {
      setIsSubmitting(true)

      const { error } = await supabase.from('events').insert([
        {
          name: values.name,
          event_type: values.event_type,
          description: values.description,
          event_date: toJakartaISOString(values.event_date, values.event_time),
          location: values.location,
          dress_code: values.dress_code,
          external_quota: values.external_quota,
          public_reg_status: 'closed',
        },
      ])

      if (error) throw error

      setIsOpen(false)
      form.reset()
      toast.success('Event berhasil dibuat.')
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
            Buat Event
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex w-[400px] flex-col p-0 sm:max-w-[450px]">
        <SheetHeader className="border-b px-6">
          <SheetTitle>Buat Event Baru</SheetTitle>
          <SheetDescription>
            Lengkapi detail event baru Anda di bawah ini. Setelah dibuat, Anda
            dapat mengatur detail tiket dan pengaturan lainnya nanti.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Event <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="cth. Halal Bihalal 2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Berikan deskripsi singkat tentang acara..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipe Event <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="public">Publik</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel>
                        Tanggal Acara{' '}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                formatJakartaDate(field.value, 'PPP')
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="z-[100] w-auto p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              // Nonaktifkan tanggal kemarin
                              const today = getJakartaNow()
                              today.setHours(0, 0, 0, 0)
                              return date < today
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_time"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel>
                        Waktu Acara <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi Acara</FormLabel>
                    <FormControl>
                      <Input placeholder="cth. Grand Ballroom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="external_quota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kuota Eksternal (Tamu Publik)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dress_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dress Code (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="cth. Smart Casual / Batik"
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
              {isSubmitting ? 'Memuat Event...' : 'Buat Event'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
