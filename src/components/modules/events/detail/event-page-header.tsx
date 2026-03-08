'use client'

import React from 'react'
import { MoveLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EventPageHeaderProps {
  name: string
}

export function EventPageHeader({ name }: EventPageHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between gap-3 px-4 py-2">
      <div className="flex items-center gap-3">
        <Link href="/admin/events">
          <Button variant="outline" size="sm" className="h-7 w-7">
            <MoveLeft className="h-3.5 w-3.5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-bold tracking-tight">{name}</h2>
          <p className="text-muted-foreground text-[10px] leading-tight">
            Lengkapi dan perbarui pengaturan khusus untuk event ini.
          </p>
        </div>
      </div>
    </div>
  )
}
