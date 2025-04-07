import CheckinModal from "@/components/organisms/CheckinModal";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Box, Button, Center, Flex, Heading, Spinner, VStack } from "@chakra-ui/react";
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
      }, 3000)
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

  const onError = useCallback((error: unknown) => {
    console.log({ error })

    setIsLoading(false)
    toaster.create({
      description: `Error: ${error}`,
      type: "error",
      duration: 2000
    })
    setTimeout(() => {
      router.reload()
    }, 3000)
  }, [router])

  return (
    <>
      <Head>
        <title>Homepage | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>

      <Flex w="100%" h="100vh" justify="center" alignItems="center">

        {
          isLoading && (
            <Box pos="absolute" zIndex="popover" inset="0" bg="bg/80">
              <Center h="full">
                <Spinner color="teal.500" size="lg" />
              </Center>
            </Box>
          )
        }

        <VStack
          w={{ base: "100%", lg: "40%" }}
          p={{ base: "2rem", lg: "4rem" }}
          borderRadius="lg"
          backgroundColor="cancel">
          <Heading fontSize="md">Silahkan scan QR Code di meja registrasi</Heading>
          <VStack minH={{ base: "100%", lg: "350px" }}>
            <Scanner onScan={checkin} onError={onError} />
          </VStack>
          <Button backgroundColor="primary" mt="1rem" w="100%" onClick={logout}>Logout</Button>
        </VStack>
        <Toaster />
      </Flex>
      <CheckinModal message={modal.message} isOpen={true} setOpen={(e) => setModal({
        state: e,
        message: modal.message
      })} />
    </>
  );
}
