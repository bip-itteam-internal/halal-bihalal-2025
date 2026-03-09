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
import {
  cn,
  formatJakartaDate,
  getJakartaNow,
  toJakartaISOString,
} from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
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
import { INVITATION_TEMPLATES as templates } from '@/lib/constants/templates'
import { Layout } from 'lucide-react'

const eventSchema = z.object({
  name: z.string().min(3, 'Nama event wajib diisi (min 3 karakter)'),
  event_type: z.enum(['internal', 'public']),
  template_id: z.string().optional().nullable(),
  event_date: z.date({
    required_error: 'Tanggal acara wajib diisi',
  }),
  event_time: z.string().optional().default('08:00'),
  location: z.string().optional(),
  external_quota: z.number().min(0),
  tenant_quota: z.number().min(0),
  is_paid: z.boolean().default(false),
  is_tenant_paid: z.boolean().default(false),
  price_external: z.number().optional().default(0),
  payment_info: z.string().optional(),
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
      template_id: null,
      location: '',
      external_quota: 1000,
      tenant_quota: 50,
      is_paid: false,
      is_tenant_paid: false,
      price_external: 0,
      payment_info: '',
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
          template_id: values.template_id,
          event_date: toJakartaISOString(values.event_date, values.event_time),
          location: values.location,
          external_quota: values.external_quota,
          tenant_quota: values.tenant_quota,
          public_reg_status: 'closed',
          is_paid: values.is_paid,
          is_tenant_paid: values.is_tenant_paid,
          price_external: values.price_external,
          payment_info: values.payment_info,
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
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Event <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="cth. Bharata Event 2026" {...field} />
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

              <FormField
                control={form.control}
                name="template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Layout className="h-3.5 w-3.5" /> Template Invitation
                      (Ready-to-use)
                    </FormLabel>
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val === 'none' ? null : val)
                      }
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih template siap pakai" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          Tanpa Template (Default)
                        </SelectItem>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs leading-none font-bold">
                                {t.name}
                              </span>
                              <span className="text-[9px] leading-none opacity-60">
                                {t.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
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
              </div>

              <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="is_paid"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div>
                        <FormLabel className="text-primary/80 text-sm font-semibold">
                          Pengaturan Pembayaran
                        </FormLabel>
                        <p className="text-muted-foreground text-[10px] italic">
                          Aktifkan jika pendaftaran memerlukan biaya
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('is_paid') && (
                  <div className="mt-2 space-y-4 border-t pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price_external"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Harga Umum (Rp)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="is_tenant_paid"
                        render={({ field }) => (
                          <FormItem className="mt-2 flex flex-col space-y-2">
                            <FormLabel className="text-xs">
                              Tenant/Booth UMKM
                            </FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <span className="text-[11px] font-medium text-slate-500">
                                {field.value ? 'Berbayar' : 'Gratis'}
                              </span>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="payment_info"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Info Rekening & Instruksi
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="cth. Silakan transfer ke BCA 123456789 a/n PT Bharata Group. Sertakan screenshot bukti transfer."
                              className="min-h-[80px] bg-black/5 text-xs"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-muted-foreground text-[10px] leading-tight opacity-70">
                            * Instruksi ini akan muncul setelah calon tamu
                            memilih tipe peserta di form pendaftaran.
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="external_quota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kuota Umum</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tenant_quota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kuota Tenant</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
