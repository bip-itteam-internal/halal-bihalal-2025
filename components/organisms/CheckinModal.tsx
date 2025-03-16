import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, Heading } from "@chakra-ui/react";
import { useCallback } from "react";

interface ICheckinModalProps {
  message: {
    name: string;
    shirt_size: string;
  };
  isOpen: boolean;
  setOpen: (state: boolean) => void
}

export default function CheckinModal({ message, isOpen, setOpen }: ICheckinModalProps) {
  const finishEvent = useCallback(() => {
    window.location.reload()
  }, [])
  return (
    <DialogRoot
      placement="center"
      closeOnEscape={false}
      closeOnInteractOutside={false}
      lazyMount
      open={isOpen}
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkin</DialogTitle>
        </DialogHeader>
        <DialogBody textAlign="center">
          <Heading mb="2rem">Checkin berhasil</Heading>
          <Heading fontSize="lg">Nama: {message.name}</Heading>
          <Heading fontSize="lg">Ukuran baju: {message.shirt_size}</Heading>
        </DialogBody>
        <DialogFooter>
          <Button onClick={finishEvent}>Finish</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}