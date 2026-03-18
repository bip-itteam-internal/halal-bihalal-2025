'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Sidebar } from '@/components/layout/sidebar'
import { PWAInstallModal } from '@/components/shared/pwa-install-modal'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDoorprize = pathname.startsWith('/admin/doorprize')

  // Doorprize is a full-screen presentation mode, so skip the sidebar
  if (isDoorprize) {
    return <div className="min-h-screen w-full">{children}</div>
  }

  return (
    <SidebarProvider>
      <PWAInstallModal />
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
        <Sidebar collapsible="icon" />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </SidebarProvider>
  )
}
