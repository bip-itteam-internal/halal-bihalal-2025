import CheckinModal from "@/components/organisms/CheckinModal";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Box, Button, Center, Container, Heading, Spinner, VStack } from "@chakra-ui/react";
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import Cookies from "js-cookie";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [modal, setModal] = useState({
    state: false,
    message: {
      name: "Unknown",
      shirt_size: "Unknown"
    }
  });

  const logout = useCallback(() => {
    Cookies.remove("token");
    router.reload()
  }, [router])

  const checkin = useCallback(async (result: IDetectedBarcode[]) => {
    setIsLoading(true);

    const token = Cookies.get("token")
    if (!token) router.replace("/")

    const response = await fetch(result[0].rawValue, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })

    const { name, shirt_size, message } = await response.json()

    if (!response.ok) {
      setIsLoading(false)
      toaster.create({
        description: `Error: ${message}`,
        type: "error",
        duration: 2000
      })
      setTimeout(() => {
        router.reload()
      }, 1000)
    }

    if (response.ok) {
      setIsLoading(false);
      setModal({
        state: true,
        message: {
          name,
          shirt_size
        }
      })
    }
  }, [router])


  return (
    <>
      <Head>
        <title>Homepage | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>

      <Container w={{ base: "360px", md: "400px" }}>

        {
          isLoading && (
            <Box pos="absolute" zIndex="popover" inset="0" bg="bg/80">
              <Center h="full">
                <Spinner color="teal.500" size="lg" />
              </Center>
            </Box>
          )
        }

        <VStack h="calc(100vh - 20vh)" justify="center" alignItems="center">
          <Heading fontSize="lg">Silahkan scan QR Code di tempat acara</Heading>
          <VStack w="100%" minH="350px">

            <Scanner onScan={checkin} />

          </VStack>
          <Button mt="1rem" w="100%" onClick={logout}>Logout</Button>
        </VStack>
        <Toaster />
      </Container>
      <CheckinModal message={modal.message} isOpen={modal.state} setOpen={(e) => setModal({
        state: e,
        message: modal.message
      })} />
    </>
  );
}
