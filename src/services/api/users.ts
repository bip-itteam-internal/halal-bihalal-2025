import { PermissionRole, UserRole } from '@/types'

export type ManagedPermission = {
  id: string
  event_id: string
  role: PermissionRole
}

export type ManagedUser = {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
  created_at: string
  permissions: ManagedPermission[]
}

export type EventOption = {
  id: string
  name: string
  event_date: string
}

export type UsersResponse = {
  users: ManagedUser[]
  events: EventOption[]
}

export async function getUsersData(): Promise<UsersResponse> {
  const res = await fetch('/api/admin/users')
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat data user')
  }

  return data as UsersResponse
}

export async function createUser(payload: {
  email: string
  full_name: string
  role: UserRole
}) {
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Gagal membuat akun.')
  }

  return data
}

export async function updateUserRole(userId: string, role: UserRole) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Gagal update role.')
  }
}

export async function updateUserPermissions(
  userId: string,
  permissions: Partial<ManagedPermission>[],
) {
  const res = await fetch(`/api/admin/users/${userId}/permissions`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permissions }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Gagal update permissions.')
  }
}

export async function deleteUser(userId: string) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Gagal menghapus user.')
  }
}
