import CheckinModal from "@/components/organisms/CheckinModal";
import { Button, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Cookies from "js-cookie";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";

export default function Home() {
  // const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const router = useRouter()

  const [modal, setModal] = useState({
    state: false,
    title: ""
  });

  const logout = useCallback(() => {
    Cookies.remove("token");
    window && window.location.reload();
  }, [])

  useEffect(() => {
    const token = Cookies.get("token")
    if (!token) router.replace("/user-login")

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10, qrbox: { width: 250, height: 250 }
      },
      false
    )

    scannerRef.current.render(
      (decodedText) => {
        // setScanResult(decodedText);
        (async function () {
          const result = await fetch(decodedText, {
            method: "POST",

            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          })

          const { name, shirt_size, message } = await result.json()

          if (!result.ok) {
            toaster.create({
              description: `Error: ${message}`,
              type: "error",
              duration: 2000
            })
          }

          if (result.ok) setModal({
            state: true,
            title: `Welcome ${name}, your size is ${shirt_size}`
          })
        })()
        scannerRef.current?.clear();
      },
      (error) => console.error(error)
    );

    return () => {
      scannerRef.current?.clear();
    };
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
          <VStack>
            <div id="qr-reader" />
            {/* {scanResult && <Text>{scanResult}</Text>} */}
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
