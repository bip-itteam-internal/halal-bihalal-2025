'use client'

import { MoveRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface InternalOnlyRegisterButtonProps {
  eventName: string
}

export function InternalOnlyRegisterButton({
  eventName,
}: InternalOnlyRegisterButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="secondary">
          Info Undangan <MoveRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Khusus Tamu Undangan</DialogTitle>
          <DialogDescription>
            Event <span className="font-semibold">{eventName}</span> hanya untuk
            tamu undangan internal.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
