'use client'

import React from 'react'
import { MoveLeft, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EventPageHeaderProps {
  name: string
  onSave: () => void
  onDelete: () => void
  saving: boolean
}

export function EventPageHeader({
  name,
  onSave,
  onDelete,
  saving,
}: EventPageHeaderProps) {
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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Hapus
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? (
              'Menyimpan...'
            ) : (
              <>
                <Save className="mr-2 h-3.5 w-3.5" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
