import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@chakra-ui/react";
import { useCallback } from "react";

interface ICheckinModalProps {
  title: string;
  isOpen: boolean;
  setOpen: (state: boolean) => void
}

export default function CheckinModal({ title, isOpen, setOpen }: ICheckinModalProps) {
  const finishEvent = useCallback(() => {
    window.location.reload()
  }, [])
  return (
    <DialogRoot
      lazyMount
      open={isOpen}
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>
            {title}
          </p>
        </DialogBody>
        <DialogFooter>
          <Button onClick={finishEvent}>Finish</Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}