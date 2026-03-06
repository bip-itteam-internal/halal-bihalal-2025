import * as React from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Sidebar } from '@/components/layout/sidebar'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  headerSticky?: boolean
  headerClassName?: string
}

export function AppLayout({
  children,
  header,
  headerSticky = true,
  headerClassName,
}: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div
            className={cn(
              'shrink-0 bg-white dark:bg-slate-900',
              headerSticky && 'sticky top-0 z-30',
            )}
          >
            <div className="border-b border-slate-100 p-4 md:hidden dark:border-slate-800">
              <SidebarTrigger />
            </div>
            {header && (
              <div
                className={cn(
                  'border-b border-slate-100 dark:border-slate-800',
                  headerClassName,
                )}
              >
                {header}
              </div>
            )}
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
