import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'super_admin') {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
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
      return NextResponse.json({ message: 'User ID tidak valid.' }, { status: 400 })
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
    const admin = createAdminClient()

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)

    if (profileError) throw profileError

    if (Object.prototype.hasOwnProperty.call(updates, 'full_name')) {
      const { error: metadataError } = await admin.auth.admin.updateUserById(id, {
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
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
