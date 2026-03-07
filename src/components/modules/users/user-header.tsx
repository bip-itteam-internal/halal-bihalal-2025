import { Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export function UserHeader() {
  return (
    <PageHeader
      title="User Management"
      subtitle="Buat akun admin/staff dan atur akses event per user."
      backHref="/admin/dashboard"
    />
  )
}
