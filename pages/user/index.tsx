import CheckinModal from "@/components/organisms/CheckinModal";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Button, Container, Heading, VStack } from "@chakra-ui/react";
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import Cookies from "js-cookie";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

export default function Home() {
  const router = useRouter()

  const [modal, setModal] = useState({
    state: false,
    title: ""
  });

  const logout = useCallback(() => {
    Cookies.remove("token");
    window && window.location.reload();
  }, [router])

  const checkin = useCallback(async (result: IDetectedBarcode[]) => {
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
      toaster.create({
        description: `Error: ${message}`,
        type: "error",
        duration: 2000
      })
      setTimeout(() => {
        window.location.reload();
      }, 3000)
    }

    if (response.ok) setModal({
      state: true,
      title: `Welcome ${name}, your size is ${shirt_size}`
    })
  }, [])


  return (
    <>
      <Head>
        <title>Homepage | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>

      <Container w={{ base: "360px", md: "400px" }}>
        <VStack h="calc(100vh - 20vh)" justify="center" alignItems="center">
          <Heading fontSize="lg">Silahkan scan QR Code di tempat acara</Heading>
          <VStack w="100%" minH="350px">

            <Scanner onScan={(result) => checkin(result)} />

          </VStack>
          <Button mt="1rem" w="100%" onClick={logout}>Logout</Button>
        </VStack>
        <Toaster />
      </Container>
      <CheckinModal title={modal.title} isOpen={modal.state} setOpen={(e) => setModal({
        state: e,
        title: modal.title
      })} />
    </>
  );
}
