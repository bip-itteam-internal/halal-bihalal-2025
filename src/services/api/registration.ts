export interface RegisterGuestPayload {
  full_name: string
  phone: string
  guest_type: 'external' | 'tenant'
  address: string
  metadata?: Record<string, unknown>
}

export interface RegisterGuestResponse {
  guest_id: string
  qr_payload: string
  message?: string
}

export async function registerGuest(
  eventIdentifier: string,
  payload: RegisterGuestPayload,
): Promise<RegisterGuestResponse> {
  const res = await fetch(`/api/register/${eventIdentifier}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.message || 'Gagal melakukan pendaftaran. Silakan coba lagi.',
    )
  }

  return data
}
