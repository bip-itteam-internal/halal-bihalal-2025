import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GuestTypeToggleProps {
  registrationType: 'external' | 'tenant'
  setRegistrationType: (type: 'external' | 'tenant') => void
}

export function GuestTypeToggle({
  registrationType,
  setRegistrationType,
}: GuestTypeToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/5 bg-black/40 p-1">
      <Button
        type="button"
        variant="ghost"
        className={cn(
          'h-9 rounded-lg transition-all',
          registrationType === 'external'
            ? 'bg-amber-500 text-black hover:bg-amber-500 hover:text-black'
            : 'text-slate-400 hover:text-white',
        )}
        onClick={() => setRegistrationType('external')}
      >
        Umum / Eksternal
      </Button>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          'h-9 rounded-lg transition-all',
          registrationType === 'tenant'
            ? 'bg-amber-500 text-black hover:bg-amber-500 hover:text-black'
            : 'text-slate-400 hover:text-white',
        )}
        onClick={() => setRegistrationType('tenant')}
      >
        Tenant
      </Button>
    </div>
  )
}
