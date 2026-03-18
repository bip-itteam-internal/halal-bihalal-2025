import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

type UpdateUserPayload = {
  full_name?: string
  role?: 'admin' | 'staff'
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await assertSuperAdmin()
    if (auth.error) return auth.error

    const { id } = await params
    const body = (await req.json()) as UpdateUserPayload

    if (!id) {
      return NextResponse.json(
        { message: 'User ID tidak valid.' },
        { status: 400 },
      )
    }

    const updates: Record<string, unknown> = {}
    if (typeof body.full_name === 'string') {
      updates.full_name = body.full_name.trim() || null
    }
    if (body.role) {
      if (!['admin', 'staff'].includes(body.role)) {
        return NextResponse.json(
          { message: 'Role hanya boleh admin atau staff.' },
          { status: 400 },
        )
      }
      updates.role = body.role
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: 'Tidak ada perubahan yang dikirim.' },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)

    if (profileError) throw profileError

    if (Object.prototype.hasOwnProperty.call(updates, 'full_name')) {
      const { error: metadataError } =
        await adminClient.auth.admin.updateUserById(id, {
          user_metadata: {
            full_name: updates.full_name,
          },
        })
      if (metadataError) throw metadataError
    }

    return NextResponse.json({ message: 'Data user berhasil diperbarui.' })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: 'Gagal memperbarui data user.',
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await assertSuperAdmin()
    if (auth.error) return auth.error

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: 'User ID tidak valid.' },
        { status: 400 },
      )
    }

    // 1. Hapus dari Supabase Auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(id)
    if (authError) throw authError

    // 2. Hapus dari tabel profiles
    const supabase = await createClient()
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) throw profileError

    return NextResponse.json({ message: 'User berhasil dihapus secara permanen.' })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: 'Gagal menghapus user.',
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
