import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PermissionRole, UserRole } from '@/types'
import {
  getUsersData,
  createUser as apiCreateUser,
  updateUserRole,
  updateUserPermissions,
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
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal membuat akun.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateUser = async (user: ManagedUser) => {
    try {
      setSubmitting(true)
      const role = roleDraftByUserId[user.id]
      const permsDraft = permissionDraftByUserId[user.id] || {}

      // 1. Update Role
      await updateUserRole(user.id, role)

      // 2. Update Permissions
      const permissions = Object.entries(permsDraft)
        .filter(([, role]) => role === 'manager' || role === 'scanner')
        .map(([event_id, role]) => ({
          event_id,
          role: role as PermissionRole,
        }))

      await updateUserPermissions(user.id, permissions)

      toast.success('Data user berhasil diperbarui.')
      await fetchData()
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal update data user.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleSavePermissionsFromDialog = async () => {
    if (!activePermissionUser) return
    try {
      const permsDraft = permissionDraftByUserId[activePermissionUser.id] || {}
      const permissions = Object.entries(permsDraft)
        .filter(([, role]) => role === 'manager' || role === 'scanner')
        .map(([event_id, role]) => ({
          event_id,
          role: role as PermissionRole,
        }))

      await updateUserPermissions(activePermissionUser.id, permissions)

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
    handleUpdateUser,
    handleSavePermissionsFromDialog,
  }
}
