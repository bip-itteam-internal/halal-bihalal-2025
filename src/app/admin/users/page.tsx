'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { MoveLeft, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatJakartaDate } from '@/lib/utils'
import { PermissionRole, UserRole } from '@/types'

type ManagedPermission = {
  id: string
  event_id: string
  role: PermissionRole
}

type ManagedUser = {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
  created_at: string
  permissions: ManagedPermission[]
}

type EventOption = {
  id: string
  name: string
  event_date: string
}

type UsersResponse = {
  users: ManagedUser[]
  events: EventOption[]
}

export default function UserManagementPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [events, setEvents] = useState<EventOption[]>([])
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'staff' as 'admin' | 'staff',
  })
  const [roleDraftByUserId, setRoleDraftByUserId] = useState<
    Record<string, UserRole>
  >({})
  const [activePermissionUser, setActivePermissionUser] =
    useState<ManagedUser | null>(null)
  const [permissionDraft, setPermissionDraft] = useState<Record<string, string>>(
    {},
  )

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users')
      const data = (await res.json()) as UsersResponse & { message?: string }
      if (!res.ok) throw new Error(data.message || 'Gagal memuat data user')

      setUsers(data.users || [])
      setEvents(data.events || [])
      setRoleDraftByUserId(
        Object.fromEntries((data.users || []).map((u) => [u.id, u.role])),
      )
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openPermissionDialog = (user: ManagedUser) => {
    const draft: Record<string, string> = {}
    user.permissions.forEach((permission) => {
      draft[permission.event_id] = permission.role
    })
    setPermissionDraft(draft)
    setActivePermissionUser(user)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = (await res.json()) as { message?: string }
      if (!res.ok) throw new Error(data.message || 'Gagal membuat akun.')

      toast.success('Akun berhasil dibuat.')
      setCreateForm({
        email: '',
        password: '',
        full_name: '',
        role: 'staff',
      })
      await fetchData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat akun.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateRole = async (userId: string) => {
    try {
      const role = roleDraftByUserId[userId]
      if (!role || role === 'super_admin') return

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const data = (await res.json()) as { message?: string }
      if (!res.ok) throw new Error(data.message || 'Gagal update role.')

      toast.success('Role berhasil diperbarui.')
      await fetchData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal update role.')
    }
  }

  const handleSavePermissions = async () => {
    if (!activePermissionUser) return
    try {
      const permissions = Object.entries(permissionDraft)
        .filter(([, role]) => role === 'manager' || role === 'scanner')
        .map(([event_id, role]) => ({
          event_id,
          role: role as PermissionRole,
        }))

      const res = await fetch(
        `/api/admin/users/${activePermissionUser.id}/permissions`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions }),
        },
      )
      const data = (await res.json()) as { message?: string }
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan permission.')

      toast.success('Permission event berhasil disimpan.')
      setActivePermissionUser(null)
      await fetchData()
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menyimpan permission.',
      )
    }
  }

  const managedUsers = useMemo(
    () => users.filter((user) => user.role !== 'super_admin'),
    [users],
  )

  return (
    <AppLayout
      header={
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
      }
    >
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Buat Akun Baru
              </CardTitle>
              <CardDescription>
                Hanya untuk role `admin` dan `staff`.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input
                  placeholder="Nama lengkap"
                  value={createForm.full_name}
                  onChange={(e) =>
                    setCreateForm((v) => ({ ...v, full_name: e.target.value }))
                  }
                />
                <Input
                  type="email"
                  placeholder="email@domain.com"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((v) => ({ ...v, email: e.target.value }))
                  }
                  required
                />
                <Input
                  type="password"
                  placeholder="Password minimal 8 karakter"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((v) => ({ ...v, password: e.target.value }))
                  }
                  required
                />
                <Select
                  value={createForm.role}
                  onValueChange={(value: 'admin' | 'staff') =>
                    setCreateForm((v) => ({ ...v, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Membuat akun...' : 'Buat Akun'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Daftar User
              </CardTitle>
              <CardDescription>
                Total user yang dikelola: {managedUsers.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Memuat data...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Akses Event</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">
                            {user.full_name || 'Tanpa nama'}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {user.email || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[160px]">
                          <Select
                            value={(roleDraftByUserId[user.id] || user.role) as string}
                            onValueChange={(value: 'admin' | 'staff') =>
                              setRoleDraftByUserId((prev) => ({
                                ...prev,
                                [user.id]: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.permissions.length} event
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatJakartaDate(user.created_at, 'PPP p')}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateRole(user.id)}
                            >
                              <ShieldCheck className="h-4 w-4" />
                              Simpan Role
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPermissionDialog(user)}
                            >
                              Permission
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={Boolean(activePermissionUser)}
        onOpenChange={(open) => !open && setActivePermissionUser(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Atur Permission Event</DialogTitle>
            <DialogDescription>
              Pilih role akses untuk setiap event. Kosongkan jika tidak punya akses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-4 rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{event.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatJakartaDate(event.event_date, 'PPP p')}
                  </p>
                </div>
                <Select
                  value={permissionDraft[event.id] || 'none'}
                  onValueChange={(value) =>
                    setPermissionDraft((prev) => ({
                      ...prev,
                      [event.id]: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Akses</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="scanner">Scanner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setActivePermissionUser(null)}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleSavePermissions}>
              Simpan Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
