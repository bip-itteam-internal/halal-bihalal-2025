'use client'

import { CheckCircle2, Printer } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RegistrationSuccessProps {
  invitationCode: string
  registeredName: string
  registeredGuestType: 'external' | 'tenant'
  inline?: boolean
}

export function RegistrationSuccess({
  invitationCode,
  registeredName,
  registeredGuestType,
  inline = false,
}: RegistrationSuccessProps) {
  const content = (
    <Card className={inline ? 'border-none bg-transparent shadow-none' : ''}>
      <CardHeader
        className={inline ? 'pb-3 text-center' : 'space-y-3 text-center'}
      >
        {!inline && (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        )}
        {!inline && (
          <CardTitle className="text-2xl">Pendaftaran Berhasil</CardTitle>
        )}
        <CardDescription className={inline ? 'font-medium text-slate-400' : ''}>
          Simpan QR code ini untuk proses check-in di lokasi acara.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div
          className={
            inline
              ? 'rounded-[2rem] bg-white p-6'
              : 'bg-background rounded-lg border p-4'
          }
        >
          <div className="mx-auto flex w-fit items-center justify-center rounded-md bg-white p-2">
            <QRCode
              value={invitationCode}
              size={inline ? 180 : 210}
              viewBox="0 0 256 256"
            />
          </div>
        </div>

        <div
          className={
            inline
              ? 'space-y-3 rounded-2xl border border-white/5 bg-black/20 p-4'
              : 'bg-muted/40 space-y-3 rounded-lg border p-4'
          }
        >
          <div
            className={
              inline
                ? 'text-[10px] font-bold tracking-widest text-slate-500 uppercase'
                : 'text-muted-foreground text-xs'
            }
          >
            Nama Tamu
          </div>
          <div
            className={
              inline
                ? 'text-base font-bold text-white'
                : 'text-base font-semibold'
            }
          >
            {registeredName}
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <Badge
              variant="secondary"
              className={inline ? 'border-none bg-amber-500 text-black' : ''}
            >
              {registeredGuestType === 'tenant' ? 'TENANT' : 'EKSTERNAL'}
            </Badge>
            <span
              className={
                inline
                  ? 'font-mono text-[10px] text-slate-500'
                  : 'text-muted-foreground font-mono text-xs'
              }
            >
              {invitationCode}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          className={
            inline
              ? 'w-full bg-amber-500 text-black hover:bg-amber-400'
              : 'w-full'
          }
          onClick={() => window.print()}
        >
          <Printer className="mr-2 h-4 w-4" />
          Cetak / Simpan Tiket
        </Button>
        {!inline && (
          <Link
            href="/halal-bihalal-dan-spesial-konser-wali-band-2026"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-zinc-500 uppercase transition-colors hover:text-white"
          >
            Kembali ke Beranda
          </Link>
        )}
      </CardFooter>
    </Card>
  )

  if (inline) return content

  return (
    <div className="bg-muted/40 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-md">{content}</div>
    </div>
  )
}
