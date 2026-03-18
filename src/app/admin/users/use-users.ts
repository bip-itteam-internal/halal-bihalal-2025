import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PermissionRole, UserRole } from '@/types'
import {
  getUsersData,
  createUser as apiCreateUser,
  updateUserRole,
  updateUserPermissions,
  deleteUser as apiDeleteUser,
  ManagedUser,
  EventOption,
} from '@/services/api/users'

export type { ManagedUser, EventOption }

export function useUsers() {
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
  const [permissionDraftByUserId, setPermissionDraftByUserId] = useState<
    Record<string, Record<string, string>>
  >({})

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUsersData()

      setUsers(data.users || [])
      setEvents(data.events || [])

      const roleDrafts: Record<string, UserRole> = {}
      const permDrafts: Record<string, Record<string, string>> = {}

      ;(data.users || []).forEach((u) => {
        roleDrafts[u.id] = u.role
        const userPerms: Record<string, string> = {}
        u.permissions.forEach((p) => {
          userPerms[p.event_id] = p.role
        })
        permDrafts[u.id] = userPerms
      })

      setRoleDraftByUserId(roleDrafts)
      setPermissionDraftByUserId(permDrafts)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await apiCreateUser(createForm)

      toast.success('Akun berhasil dibuat.')
      setCreateForm({
        email: '',
        password: '',
        full_name: '',
        role: 'staff',
      })
      await fetchData()
      return true
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal membuat akun.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    try {
      setSubmitting(true)
      await updateUserRole(userId, role)
      toast.success('Role berhasil diperbarui.')
      await fetchData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal update role.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdatePermission = async (userId: string, eventId: string, role: string) => {
    try {
      setSubmitting(true)
      const currentDraft = permissionDraftByUserId[userId] || {}
      const newDraft = { ...currentDraft, [eventId]: role }

      const permissions = Object.entries(newDraft)
        .filter(([, r]) => r === 'manager' || r === 'scanner')
        .map(([e_id, r]) => ({
          event_id: e_id,
          role: r as PermissionRole,
        }))

      await updateUserPermissions(userId, permissions)
      toast.success('Permission berhasil diperbarui.')
      await fetchData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal update permission.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDeleteUser = async (userId: string) => {
    try {
      setSubmitting(true)
      await apiDeleteUser(userId)
      toast.success('User berhasil dihapus.')
      await fetchData()
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menghapus user.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const managedUsers = useMemo(
    () => users.filter((user) => user.role !== 'super_admin'),
    [users],
  )

  return {
    loading,
    submitting,
    users,
    managedUsers,
    events,
    createForm,
    setCreateForm,
    roleDraftByUserId,
    setRoleDraftByUserId,
    activePermissionUser,
    setActivePermissionUser,
    permissionDraftByUserId,
    setPermissionDraftByUserId,
    handleCreateUser,
    handleUpdateRole,
    handleUpdatePermission,
    handleConfirmDeleteUser,
  }
}
