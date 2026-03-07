import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ScanResult } from '@/app/admin/scanner/use-scanner'

interface ScannerResultCardProps {
  result: ScanResult | null
}

export function ScannerResultCard({ result }: ScannerResultCardProps) {
  if (!result) return null

  return (
    <Card
      className={cn(
        'border-l-4',
        result.success ? 'border-l-emerald-500' : 'border-l-red-500',
      )}
    >
      <CardContent className="flex items-start gap-3 p-4 sm:pt-6">
        {result.success ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
        <div className="space-y-1">
          <p className="font-semibold">
            {result.success ? 'Berhasil' : 'Gagal'}
          </p>
          <p className="text-muted-foreground text-sm">{result.message}</p>
          {result.guest && (
            <p className="text-sm">
              {result.guest.full_name} ({result.guest.guest_type})
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
