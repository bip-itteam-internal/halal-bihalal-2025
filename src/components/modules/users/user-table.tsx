import { ShieldCheck, Users } from 'lucide-react'
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

interface UserTableProps {
  users: ManagedUser[]
  events: EventOption[]
  loading: boolean
  submitting: boolean
  roleDrafts: Record<string, UserRole>
  setRoleDrafts: (drafts: any) => void
  permissionDrafts: Record<string, Record<string, string>>
  setPermissionDrafts: (drafts: any) => void
  onUpdateUser: (user: ManagedUser) => void
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
  onUpdateUser,
}: UserTableProps) {
  return (
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
                        value={(roleDrafts[user.id] || user.role) as string}
                        onValueChange={(value: UserRole) =>
                          setRoleDrafts((prev: any) => ({
                            ...prev,
                            [user.id]: value,
                          }))
                        }
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
                          value={
                            permissionDrafts[user.id]?.[event.id] || 'none'
                          }
                          onValueChange={(value) =>
                            setPermissionDrafts((prev: any) => ({
                              ...prev,
                              [user.id]: {
                                ...(prev[user.id] || {}),
                                [event.id]: value,
                              },
                            }))
                          }
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
                          variant="outline"
                          size="sm"
                          className="border-slate-800 bg-slate-900 text-white hover:bg-slate-800"
                          onClick={() => onUpdateUser(user)}
                          disabled={submitting}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Simpan
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
  )
}
