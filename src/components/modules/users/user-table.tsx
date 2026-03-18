import { Users, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatJakartaDate } from '@/lib/utils'
import { UserRole } from '@/types'
import { ManagedUser, EventOption } from '@/app/admin/users/use-users'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface UserTableProps {
  users: ManagedUser[]
  events: EventOption[]
  loading: boolean
  submitting: boolean
  roleDrafts: Record<string, UserRole>
  setRoleDrafts: React.Dispatch<React.SetStateAction<Record<string, UserRole>>>
  permissionDrafts: Record<string, Record<string, string>>
  setPermissionDrafts: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >
  onUpdateRole: (userId: string, role: UserRole) => void
  onUpdatePermission: (userId: string, eventId: string, role: string) => void
  onDeleteUser: (userId: string) => void
}

export function UserTable({
  users,
  events,
  loading,
  submitting,
  roleDrafts,
  setRoleDrafts,
  permissionDrafts,
  setPermissionDrafts,
  onUpdateRole,
  onUpdatePermission,
  onDeleteUser,
}: UserTableProps) {
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null)

  return (
    <>
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus{' '}
              <strong>{userToDelete?.full_name || userToDelete?.email}</strong>?
              Tindakan ini tidak dapat dibatalkan dan semua data terkait akun
              ini akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async (e) => {
                e.preventDefault()
                if (userToDelete) {
                  await onDeleteUser(userToDelete.id)
                  setUserToDelete(null)
                }
              }}
              disabled={submitting}
            >
              {submitting ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar User
          </CardTitle>
          <CardDescription>
            Total user yang dikelola: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Memuat data...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      User
                    </TableHead>
                    <TableHead className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Role
                    </TableHead>
                    {events.map((event) => (
                      <TableHead
                        key={event.id}
                        className="text-[10px] font-black tracking-widest text-slate-400 uppercase"
                      >
                        {event.name}
                      </TableHead>
                    ))}
                    <TableHead className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Dibuat
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-black tracking-widest whitespace-nowrap text-slate-400 uppercase">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium whitespace-nowrap">
                          {user.full_name || 'Tanpa nama'}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {user.email || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          disabled={submitting}
                          value={(roleDrafts[user.id] || user.role) as string}
                          onValueChange={(value: UserRole) => {
                            setRoleDrafts((prev) => ({
                              ...prev,
                              [user.id]: value,
                            }))
                            onUpdateRole(user.id, value)
                          }}
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      {events.map((event) => (
                        <TableCell key={event.id}>
                          <Select
                            disabled={submitting}
                            value={
                              permissionDrafts[user.id]?.[event.id] || 'none'
                            }
                            onValueChange={(value) => {
                              setPermissionDrafts((prev) => ({
                                ...prev,
                                [user.id]: {
                                  ...(prev[user.id] || {}),
                                  [event.id]: value,
                                },
                              }))
                              onUpdatePermission(user.id, event.id, value)
                            }}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="scanner">Scanner</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      ))}
                      <TableCell className="whitespace-nowrap">
                        {formatJakartaDate(user.created_at, 'PPP')}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setUserToDelete(user)}
                            disabled={submitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
