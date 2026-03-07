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
import { EventOption } from '@/app/admin/scanner/use-scanner'

interface ScannerSettingsProps {
  events: EventOption[]
  loadingEvents: boolean
  selectedEventId: string
  setSelectedEventId: (id: string) => void
}

export function ScannerSettings({
  events,
  loadingEvents,
  selectedEventId,
  setSelectedEventId,
}: ScannerSettingsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Scanner</CardTitle>
        <CardDescription>
          Pilih event sebelum melakukan scan. Tahap check-in akan terdeteksi
          otomatis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
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
      </CardContent>
    </Card>
  )
}
