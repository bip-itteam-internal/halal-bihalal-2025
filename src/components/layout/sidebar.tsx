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
    roles: ['super_admin', 'admin'] as UserRole[],
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
  const { profile, role, clear: clearProfile } = useProfile()
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
                    <span className="font-semibold text-slate-900">
                      Bharata Event
                    </span>
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
            <SidebarGroupLabel className="px-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Main Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.map((item) => {
                  const isActive =
                    pathname.startsWith(item.url) && item.url !== '#'
                  const activeExact =
                    pathname === item.url || pathname === item.url + '/'
                  const isItemActive =
                    item.url === '/admin/dashboard' ? activeExact : isActive

                  const handleItemClick = (e: React.MouseEvent) => {
                    if (item.newTab && typeof window !== 'undefined') {
                      e.preventDefault()
                      const width = 1280
                      const height = 720
                      const left = (window.screen.width - width) / 2
                      const top = (window.screen.height - height) / 2

                      window.open(
                        item.url,
                        'DoorprizeArena',
                        `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`,
                      )
                    }
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isItemActive}
                        tooltip={item.title}
                        onClick={handleItemClick}
                        className="py-5"
                      >
                        <Link href={item.url}>
                          <item.icon className="scale-110" />
                          <span className="font-medium">{item.title}</span>
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
          {profile && (
            <div className="mx-2 mb-2 rounded-xl border bg-slate-50/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm ring-2 ring-white">
                  <span className="text-[14px] font-bold uppercase">
                    {(profile.full_name || 'A').charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {profile.full_name || 'Administrator'}
                  </p>
                  <p className="truncate text-[10px] font-medium text-slate-500 lowercase">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Keluar"
                onClick={() => setIsLogoutOpen(true)}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <LogOut />
                <span className="font-medium text-[13px]">Logout</span>
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
