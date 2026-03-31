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

import { CheckCircle2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormFieldsProps {
  form: UseFormReturn<RegistrationFormValues>
  isPaid?: boolean
  paymentFile?: File | null
  setPaymentFile?: (file: File | null) => void
}

export function FormFields({
  form,
  isPaid,
  paymentFile,
  setPaymentFile,
}: FormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">
              Nama Lengkap
              <RequiredMark />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan nama lengkap"
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
              Alamat
              <RequiredMark />
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Contoh: Jl. Merdeka No. 1, Cipari"
                className="min-h-24 border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus:border-amber-500/50"
                required
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isPaid && setPaymentFile && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="flex items-center gap-2 text-zinc-300">
              Bukti Transfer
              <RequiredMark />
            </FormLabel>
            {paymentFile && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase">
                <CheckCircle2 className="h-3 w-3" /> Terpilih
              </span>
            )}
          </div>

          <div
            className={cn(
              'group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-8 transition-all',
              paymentFile
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-white/10 bg-black/20 hover:border-amber-500/30 hover:bg-black/40',
            )}
            onClick={() => document.getElementById('payment-upload')?.click()}
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
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="max-w-[200px] truncate text-xs font-bold text-emerald-500">
                    {paymentFile.name}
                  </p>
                  <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase opacity-50">
                    Klik untuk ganti
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-zinc-500 transition-colors group-hover:bg-amber-500/10 group-hover:text-amber-500">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-400 group-hover:text-amber-500">
                    Upload Bukti Pembayaran
                  </p>
                  <p className="text-[9px] font-black tracking-widest text-zinc-600 uppercase">
                    JPG, PNG • MAX 2MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
