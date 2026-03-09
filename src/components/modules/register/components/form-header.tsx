import React from 'react'

interface RegistrationFormHeaderProps {
  forcedGuestType: 'external' | 'tenant' | null
}

export function RegistrationFormHeader({
  forcedGuestType,
}: RegistrationFormHeaderProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-bold tracking-tight text-white uppercase">
        Form <span className="text-amber-500">Pendaftaran</span>
      </h3>
      <p className="text-sm text-slate-400">
        {forcedGuestType === 'tenant'
          ? 'Silakan isi formulir pendaftaran untuk Booth UMKM.'
          : forcedGuestType === 'external'
            ? 'Silakan isi formulir pendaftaran untuk tamu umum.'
            : 'Silakan isi formulir pendaftaran di bawah ini.'}
      </p>
    </div>
  )
}
