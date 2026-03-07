import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'

export function ScannerHeader() {
  return (
    <PageHeader
      title="Scanner Undangan"
      subtitle="Kelola check-in untuk event ini."
      backHref="/admin/events"
    />
  )
}
