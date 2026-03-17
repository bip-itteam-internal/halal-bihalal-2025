import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

type PermissionInput = {
  event_id: string
  role: 'manager' | 'scanner'
}

type UpdatePermissionsPayload = {
  permissions: PermissionInput[]
}

async function assertSuperAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'super_admin') {
    return {
      error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }),
    }
  }

  return { userId: user.id }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await assertSuperAdmin()
    if (auth.error) return auth.error

    const { id } = await params
    const body = (await req.json()) as UpdatePermissionsPayload
    const permissions = body.permissions || []

    const invalidPermission = permissions.find(
      (permission) =>
        !permission.event_id ||
        !['manager', 'scanner'].includes(permission.role),
    )

    if (invalidPermission) {
      return NextResponse.json(
        { message: 'Data permission tidak valid.' },
        { status: 400 },
      )
    }

    const { error: deleteError } = await adminClient
      .from('event_permissions')
      .delete()
      .eq('user_id', id)

    if (deleteError) throw deleteError

    if (permissions.length > 0) {
      const payload = permissions.map((permission) => ({
        user_id: id,
        event_id: permission.event_id,
        role: permission.role,
      }))

      const { error: insertError } = await adminClient
        .from('event_permissions')
        .insert(payload)

      if (insertError) throw insertError
    }

    return NextResponse.json({
      message: 'Permission event berhasil diperbarui.',
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: 'Gagal memperbarui permission event.',
        detail:
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error
              ? (error as { message: string }).message
              : String(error),
      },
      { status: 500 },
    )
  }
}
