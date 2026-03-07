import Link from 'next/link'
import { MoveLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserHeader() {
  return (
    <div className="flex items-center gap-4 px-8 py-6">
      <Link href="/admin/events">
        <Button variant="outline" size="icon">
          <MoveLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Buat akun admin/staff dan atur akses event per user.
        </p>
      </div>
    </div>
  )
}
