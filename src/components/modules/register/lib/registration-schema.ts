import { z } from 'zod'

export const registrationSchema = z.object({
  full_name: z.string().min(3, 'Nama minimal 3 karakter.'),
  phone: z
    .string()
    .min(8, 'Nomor WhatsApp tidak valid.')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor WhatsApp tidak valid.'),
  address: z.string().optional(),
})

export type RegistrationFormValues = z.infer<typeof registrationSchema>
