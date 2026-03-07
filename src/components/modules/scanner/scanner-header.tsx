import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ScannerHeaderProps {
  eventName: string
}

export function ScannerHeader({ eventName }: ScannerHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/events">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold sm:text-xl">Scanner Undangan</h1>
          <p className="text-muted-foreground text-sm">
            Kelola check-in untuk event ini.
          </p>
        </div>
      </div>
      <Badge
        variant="secondary"
        className="max-w-[200px] truncate border-emerald-200 bg-emerald-50 text-emerald-700"
      >
        {eventName}
      </Badge>
    </div>
  )
}
