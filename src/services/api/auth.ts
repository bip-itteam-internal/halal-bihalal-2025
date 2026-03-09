export interface GuestLoginPayload {
  phone: string
  guest_type?: 'internal' | 'tenant' | 'external'
}

export interface GuestLoginResponse {
  guest_id: string
  message: string
}

export async function loginGuest(
  eventIdentifier: string,
  payload: GuestLoginPayload,
): Promise<GuestLoginResponse> {
  const res = await fetch(`/api/guest-login/${eventIdentifier}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.message || 'Data tamu tidak valid atau tidak terdaftar.',
    )
  }

  return data
}
