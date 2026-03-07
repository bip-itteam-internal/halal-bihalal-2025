import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  backHref?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  icon,
  backHref,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex min-w-0 items-start gap-2 sm:gap-3', className)}>
      {backHref && (
        <Link href={backHref} className="mt-1 shrink-0">
          <Button variant="ghost" size="icon" className="-ml-1 h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
      )}

      {icon && (
        <div className="text-muted-foreground mt-1.5 hidden shrink-0 sm:block">
          {icon}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div>
          <h2 className="text-[15px] leading-tight font-extrabold tracking-tight text-slate-900 sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5 text-[10px] leading-tight font-medium sm:text-[11px]">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
