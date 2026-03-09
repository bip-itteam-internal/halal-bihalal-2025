import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PermissionRole, UserRole } from '@/types'

type CreateUserPayload = {
  email: string
  password: string
  full_name?: string
  role: Exclude<UserRole, 'super_admin'>
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

export async function GET() {
  try {
    const auth = await assertSuperAdmin()
    if (auth.error) return auth.error

    const supabase = await createClient()
    const admin = createClient()

    const [
      { data: profiles, error: profilesError },
      { data: permissions, error: permissionsError },
      { data: events, error: eventsError },
      usersResponse,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('event_permissions')
        .select('id, user_id, event_id, role, created_at'),
      supabase
        .from('events')
        .select('id, name, event_date')
        .order('event_date', { ascending: false }),
      (await admin).auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ])

    if (profilesError) throw profilesError
    if (permissionsError) throw permissionsError
    if (eventsError) throw eventsError
    if (usersResponse.error) throw usersResponse.error

    const emailById = new Map(
      (usersResponse.data.users || []).map((u) => [u.id, u.email ?? '']),
    )

    const groupedPermissions = (permissions || []).reduce<
      Record<
        string,
        Array<{ id: string; event_id: string; role: PermissionRole }>
      >
    >((acc, permission) => {
      if (!acc[permission.user_id]) acc[permission.user_id] = []
      acc[permission.user_id].push({
        id: permission.id,
        event_id: permission.event_id,
        role: permission.role as PermissionRole,
      })
      return acc
    }, {})

    const users = (profiles || []).map((profile) => ({
      ...profile,
      email: emailById.get(profile.id) || null,
      permissions: groupedPermissions[profile.id] || [],
    }))

    return NextResponse.json({
      users,
      events: events || [],
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: 'Gagal mengambil data user management.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await assertSuperAdmin()
    if (auth.error) return auth.error

    const body = (await req.json()) as CreateUserPayload
    const email = body.email?.trim().toLowerCase()
    const password = body.password?.trim()
    const fullName = body.full_name?.trim()
    const role = body.role

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: 'Email, password, dan role wajib diisi.' },
        { status: 400 },
      )
    }

    if (!['admin', 'staff'].includes(role)) {
      return NextResponse.json(
        { message: 'Role hanya boleh admin atau staff.' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password minimal 8 karakter.' },
        { status: 400 },
      )
    }

    const admin = createClient()
    const supabase = await createClient()

    const { data: created, error: createError } = await (
      await admin
    ).auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || null },
    })

    if (createError || !created.user)
      throw createError || new Error('Gagal membuat user.')

    const { error: upsertProfileError } = await supabase
      .from('profiles')
      .upsert({
        id: created.user.id,
        full_name: fullName || null,
        role,
      })

    if (upsertProfileError) throw upsertProfileError

    return NextResponse.json({
      message: 'Akun berhasil dibuat.',
      user: {
        id: created.user.id,
        email: created.user.email,
        full_name: fullName || null,
        role,
      },
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: 'Gagal membuat akun baru.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
