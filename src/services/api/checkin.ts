import { Guest } from '@/types'

export interface CheckinParams {
  event_id: string
  invitation_code: string
}

export interface CheckinResponse {
  success: boolean
  message: string
  guest?: Guest
}

export class CheckinError extends Error {
  guest?: Guest
  constructor(message: string, guest?: Guest) {
    super(message)
    this.name = 'CheckinError'
    this.guest = guest
  }
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
    throw new CheckinError(data.message || 'Gagal check-in', data.guest)
  }

  return {
    success: true,
    message: data.message,
    guest: data.guest,
  }
}
