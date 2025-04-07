import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import { Button, Heading, Image, VStack } from "@chakra-ui/react";
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
        </DialogHeader>
        <DialogBody >
          <VStack textAlign="center" justifyContent="center" alignItems="center">
            <Heading mb="2rem">Checkin berhasil</Heading>
            <Image src="/kaos.jpeg" alt="kaos" />
            <Heading fontSize="lg">Nama: {message.name}</Heading>
            <Heading fontSize="lg">Ukuran baju: {message.shirt_size}</Heading>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button backgroundColor="primary" onClick={finishEvent}>Finish</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}