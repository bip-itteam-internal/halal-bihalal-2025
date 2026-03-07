'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { useUsers } from './use-users'
import { UserHeader } from '@/components/modules/users/user-header'
import { CreateUserForm } from '@/components/modules/users/create-user-form'
import { UserTable } from '@/components/modules/users/user-table'
import { UserPermissionDialog } from '@/components/modules/users/user-permission-dialog'

export default function UserManagementPage() {
  const {
    loading,
    submitting,
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
  } = useUsers()

  return (
    <AppLayout header={<UserHeader />}>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <CreateUserForm
            form={createForm}
            setForm={setCreateForm}
            onSubmit={handleCreateUser}
            submitting={submitting}
          />

          <UserTable
            users={managedUsers}
            events={events}
            loading={loading}
            submitting={submitting}
            roleDrafts={roleDraftByUserId}
            setRoleDrafts={setRoleDraftByUserId}
            permissionDrafts={permissionDraftByUserId}
            setPermissionDrafts={setPermissionDraftByUserId}
            onUpdateUser={handleUpdateUser}
          />
        </div>
      </div>

      <UserPermissionDialog
        user={activePermissionUser}
        events={events}
        onClose={() => setActivePermissionUser(null)}
        permissionDrafts={permissionDraftByUserId}
        setPermissionDrafts={setPermissionDraftByUserId}
        onSave={handleSavePermissionsFromDialog}
      />
    </AppLayout>
  )
}
