'use client'

import React from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'

interface EventPageHeaderProps {
  name: string
  onDelete: () => void
}

export function EventPageHeader({ name, onDelete }: EventPageHeaderProps) {
  return (
    <PageHeader
      title={name}
      subtitle="Perbarui pengaturan event, distribusi link, branding, dan gate tamu."
      backHref="/admin/events"
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus
        </Button>
      }
    />
  )
}
