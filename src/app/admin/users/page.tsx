'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { useUsers } from './use-users'
import { UserHeader } from '@/components/modules/users/user-header'
import { CreateUserForm } from '@/components/modules/users/create-user-form'
import { UserTable } from '@/components/modules/users/user-table'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

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
    permissionDraftByUserId,
    setPermissionDraftByUserId,
    handleCreateUser,
    handleUpdateRole,
    handleUpdatePermission,
    handleConfirmDeleteUser,
  } = useUsers()

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <AppLayout
      header={
        <div className="flex items-center justify-between w-full">
          <UserHeader />
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        </div>
      }
    >
      <div className="flex-1 space-y-6 p-8 pt-6">
        <UserTable
          users={managedUsers}
          events={events}
          loading={loading}
          submitting={submitting}
          roleDrafts={roleDraftByUserId}
          setRoleDrafts={setRoleDraftByUserId}
          permissionDrafts={permissionDraftByUserId}
          setPermissionDrafts={setPermissionDraftByUserId}
          onUpdateRole={handleUpdateRole}
          onUpdatePermission={handleUpdatePermission}
          onDeleteUser={handleConfirmDeleteUser}
        />
      </div>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Buat Akun Baru</SheetTitle>
            <SheetDescription>
              Tambahkan user baru ke sistem. Pastikan data yang dimasukkan sudah
              benar.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CreateUserForm
              form={createForm}
              setForm={setCreateForm}
              onSubmit={async (e) => {
                const success = await handleCreateUser(e)
                if (success) setIsCreateOpen(false)
              }}
              submitting={submitting}
            />
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  )
}
