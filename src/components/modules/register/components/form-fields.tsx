import React from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UseFormReturn } from 'react-hook-form'
import { RegistrationFormValues } from '../lib/registration-schema'
import { RequiredMark } from './field-helpers'

interface FormFieldsProps {
  form: UseFormReturn<RegistrationFormValues>
  registrationType: 'external' | 'tenant'
}

export function FormFields({ form, registrationType }: FormFieldsProps) {
  return (
    <>
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
              <p className="text-[10px] text-zinc-500 italic">
                * Khusus kategori F&B.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  )
}
