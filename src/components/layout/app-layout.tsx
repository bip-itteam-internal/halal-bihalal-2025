import * as React from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Sidebar } from '@/components/layout/sidebar'
import { cn } from '@/lib/utils'
import { PWAInstallModal } from '@/components/shared/pwa-install-modal'

interface AppLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  headerSticky?: boolean
  headerClassName?: string
  contentClassName?: string
}

export function AppLayout({
  children,
  header,
  headerSticky = true,
  headerClassName,
  contentClassName,
}: AppLayoutProps) {
  return (
    <SidebarProvider>
      <PWAInstallModal />
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
        <Sidebar collapsible="icon" />
        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col',
            contentClassName || 'overflow-x-hidden overflow-y-auto',
          )}
        >
          <div
            className={cn(
              'bg-background/95 supports-[backdrop-filter]:bg-background/60 shrink-0 border-b backdrop-blur',
              headerSticky && 'sticky top-0 z-40',
            )}
          >
            <div className="flex min-h-14 items-stretch">
              <div className="flex items-center border-r px-2 sm:px-4">
                <SidebarTrigger className="h-8 w-8" />
              </div>
              {header && (
                <div
                  className={cn(
                    'flex min-w-0 flex-1 flex-col justify-center px-3 py-2 sm:px-4 sm:py-0',
                    headerClassName,
                  )}
                >
                  {header}
                </div>
              )}
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
