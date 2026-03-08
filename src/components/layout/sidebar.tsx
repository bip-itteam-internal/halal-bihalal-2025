'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShieldCheck,
  LayoutDashboard,
  Timer,
  Settings,
  LogOut,
  CalendarDays,
  Users,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/use-profile'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserRole } from '@/types'

const items = [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'admin', 'staff'] as UserRole[],
  },
  {
    title: 'Master Tamu',
    url: '/admin/guests',
    icon: Users,
    roles: ['super_admin', 'admin'] as UserRole[],
  },
  {
    title: 'Events',
    url: '/admin/events',
    icon: CalendarDays,
    roles: ['super_admin', 'admin', 'staff'] as UserRole[],
  },
  {
    title: 'Scanner',
    url: '/admin/scanner',
    icon: ShieldCheck,
    roles: ['super_admin', 'admin', 'staff'] as UserRole[],
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
    roles: ['super_admin'] as UserRole[],
  },
  {
    title: 'Doorprize',
    url: '/admin/doorprize',
    icon: Timer,
    roles: ['super_admin', 'admin'] as UserRole[],
    newTab: true,
  },
  {
    title: 'Settings',
    url: '#',
    icon: Settings,
    roles: ['super_admin'] as UserRole[],
  },
  {
    title: 'Prosedur',
    url: '/admin/procedures',
    icon: BookOpen,
    roles: ['super_admin', 'admin', 'staff'] as UserRole[],
  },
]

export function Sidebar({
  ...props
}: React.ComponentProps<typeof ShadcnSidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { role, clear: clearProfile } = useProfile()
  const [isLogoutOpen, setIsLogoutOpen] = React.useState(false)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const visibleItems = items.filter((item) => item.roles.includes(role))

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      clearProfile()
      setIsLogoutOpen(false)
      router.push('/login')
      router.refresh()
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Gagal logout. Coba lagi.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <ShadcnSidebar {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/admin/dashboard">
                  <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Bharata Event</span>
                    <span className="text-[11px] opacity-70">
                      Management Panel
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.map((item) => {
                  const isActive =
                    pathname.startsWith(item.url) && item.url !== '#'
                  const activeExact =
                    pathname === item.url || pathname === item.url + '/'
                  const isItemActive =
                    item.url === '/admin/dashboard' ? activeExact : isActive

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isItemActive}
                        tooltip={item.title}
                      >
                        <Link
                          href={item.url}
                          target={item.newTab ? '_blank' : undefined}
                          rel={item.newTab ? 'noopener noreferrer' : undefined}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Keluar"
                onClick={() => setIsLogoutOpen(true)}
              >
                <LogOut />
                <span>Keluar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </ShadcnSidebar>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
            <DialogDescription>
              Anda yakin ingin keluar dari aplikasi?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoutOpen(false)}
              disabled={isLoggingOut}
            >
              Batal
            </Button>
            <Button onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Memproses...' : 'Keluar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
