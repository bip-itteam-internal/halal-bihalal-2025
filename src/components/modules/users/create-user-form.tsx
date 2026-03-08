import { UserPlus } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CreateUserFormValues {
  email: string
  password: string
  full_name: string
  role: 'admin' | 'staff'
}

interface CreateUserFormProps {
  form: CreateUserFormValues
  setForm: React.Dispatch<React.SetStateAction<CreateUserFormValues>>
  onSubmit: (e: React.FormEvent) => void
  submitting: boolean
}

export function CreateUserForm({
  form,
  setForm,
  onSubmit,
  submitting,
}: CreateUserFormProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Buat Akun Baru
        </CardTitle>
        <CardDescription>Hanya untuk role `admin` dan `staff`.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Nama lengkap"
            value={form.full_name}
            onChange={(e) =>
              setForm((v) => ({ ...v, full_name: e.target.value }))
            }
          />
          <Input
            type="email"
            placeholder="email@domain.com"
            value={form.email}
            onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
            required
          />
          <Input
            type="password"
            placeholder="Password minimal 8 karakter"
            value={form.password}
            onChange={(e) =>
              setForm((v) => ({ ...v, password: e.target.value }))
            }
            required
          />
          <Select
            value={form.role}
            onValueChange={(value: 'admin' | 'staff') =>
              setForm((v) => ({ ...v, role: value }))
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
  )
}
