'use client'

import { PageHeader } from '@/components/shared/page-header'
import { useSearchParams } from 'next/navigation'

export function ScannerHeader() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('event')
  
  const backHref = eventId ? `/admin/events` : '/admin/events'

  return (
    <PageHeader
      title="Scanner Undangan"
      subtitle="Kelola check-in untuk event ini."
      backHref={backHref}
    />
  )
}
