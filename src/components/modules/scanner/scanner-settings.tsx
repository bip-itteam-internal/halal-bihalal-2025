import { useSearchParams, useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Guest } from '@/types'
import { EventOption, Step, ScanResult } from '@/app/admin/scanner/use-scanner'

interface ScannerSettingsProps {
  events: EventOption[]
  loadingEvents: boolean
  selectedEventId: string
  setSelectedEventId: (id: string) => void
  step: Step
  setStep: (step: Step) => void
  pairingGuest: Guest | null
  setPairingGuest: (guest: Guest | null) => void
  setLastResult: (result: ScanResult | null) => void
  setError: (error: string) => void
}

export function ScannerSettings({
  events,
  loadingEvents,
  selectedEventId,
  setSelectedEventId,
  step,
  setStep,
  pairingGuest,
  setPairingGuest,
  setLastResult,
  setError,
}: ScannerSettingsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Scanner</CardTitle>
        <CardDescription>
          Pilih event dan tahap check-in sebelum melakukan scan.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2 sm:col-span-2">
          <Label>Event Terpilih</Label>
          <Select
            value={selectedEventId}
            onValueChange={(value) => {
              setSelectedEventId(value)
              router.replace(`/admin/scanner?event=${value}`)
            }}
            disabled={!!searchParams.get('event')}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={loadingEvents ? 'Memuat event...' : 'Pilih event'}
              />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tahap Check-in</Label>
          <Select value={step} onValueChange={(value: Step) => setStep(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exchange">Penukaran</SelectItem>
              <SelectItem value="entrance">Masuk</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {pairingGuest && (
          <div className="space-y-2 sm:col-span-3">
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-500 hover:bg-red-50"
              onClick={() => {
                setPairingGuest(null)
                setLastResult(null)
                setError('')
              }}
            >
              Batalkan Pairing ({pairingGuest.full_name})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
