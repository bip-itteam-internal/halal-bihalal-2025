import { Guest } from '@/types'

export interface CheckinParams {
  event_id: string
  qr_payload: string
}

export interface CheckinResponse {
  success: boolean
  message: string
  guest?: Guest
}

export async function submitCheckin(
  params: CheckinParams,
): Promise<CheckinResponse> {
  const res = await fetch('/api/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Gagal check-in')
  }

  return {
    success: true,
    message: data.message,
    guest: data.guest,
  }
}
