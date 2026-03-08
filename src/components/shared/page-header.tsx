import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2 sm:gap-3', className)}>
      {backHref && (
        <Link href={backHref} className="shrink-0">
          <Button variant="ghost" size="icon" className="-ml-1 h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] leading-tight font-semibold tracking-tight text-slate-900 sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5 truncate text-[10px] leading-tight font-medium sm:text-[11px]">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
