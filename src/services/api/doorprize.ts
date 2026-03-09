import { Guest } from '@/types'

export async function getDoorprizeCandidates() {
  const res = await fetch('/api/admin/doorprize/eligible')
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat kandidat doorprize.')
  }

  return (data.candidates || []) as Guest[]
}
