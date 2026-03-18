import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

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
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nama Lengkap</Label>
        <Input
          id="full_name"
          placeholder="Nama lengkap"
          value={form.full_name}
          onChange={(e) =>
            setForm((v) => ({ ...v, full_name: e.target.value }))
          }
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={form.email}
          onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Password minimal 8 karakter"
          value={form.password}
          onChange={(e) =>
            setForm((v) => ({ ...v, password: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
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
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Membuat akun...' : 'Buat Akun'}
      </Button>
    </form>
  )
}
