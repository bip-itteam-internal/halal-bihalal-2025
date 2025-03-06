import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@chakra-ui/react";

interface ICheckinModalProps {
  title: string;
  isOpen: boolean;
  setOpen: (state: boolean) => void
}

export default function CheckinModal({ title, isOpen, setOpen }: ICheckinModalProps) {
  return (
    <DialogRoot
      lazyMount
      open={isOpen}
      size="full"
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button>Save</Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}