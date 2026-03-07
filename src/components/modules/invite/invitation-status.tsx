'use client'

import React from 'react'
import { Loader2, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface InvitationStatusProps {
  type: 'loading' | 'error'
  message?: string | null
}

export function InvitationStatus({ type, message }: InvitationStatusProps) {
  if (type === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdfdfd] text-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#009262]" />
          <p className="animate-pulse text-xs font-bold tracking-widest text-slate-400 uppercase">
            Preparing Invitation...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-sm overflow-hidden p-0 rounded-3xl border-none shadow-2xl">
        <div className="h-1.5 w-full bg-red-400" />
        <CardContent className="space-y-4 pt-8 pb-10 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-200" />
          <h1 className="text-lg font-bold tracking-tight text-slate-800">
            Access Denied
          </h1>
          <p className="text-sm text-slate-500">
            {message || 'Silakan cek kembali link undangan Anda.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-6"
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
