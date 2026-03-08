import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatJakartaDate } from '@/lib/utils'
import { ManagedUser, EventOption } from '@/app/admin/users/use-users'

interface UserPermissionDialogProps {
  user: ManagedUser | null
  events: EventOption[]
  onClose: () => void
  permissionDrafts: Record<string, Record<string, string>>
  setPermissionDrafts: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >
  onSave: () => void
}

export function UserPermissionDialog({
  user,
  events,
  onClose,
  permissionDrafts,
  setPermissionDrafts,
  onSave,
}: UserPermissionDialogProps) {
  if (!user) return null

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atur Permission Event</DialogTitle>
          <DialogDescription>
            Pilih role akses untuk setiap event. Kosongkan jika tidak punya
            akses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-4 rounded-md border p-3"
            >
              <div>
                <p className="font-medium">{event.name}</p>
                <p className="text-muted-foreground text-xs">
                  {formatJakartaDate(event.event_date, 'PPP p')}
                </p>
              </div>
              <Select
                value={permissionDrafts[user.id]?.[event.id] || 'none'}
                onValueChange={(value) =>
                  setPermissionDrafts((prev) => ({
                    ...prev,
                    [user.id]: {
                      ...(prev[user.id] || {}),
                      [event.id]: value,
                    },
                  }))
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa Akses</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="scanner">Scanner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="button" onClick={onSave}>
            Simpan Permission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
