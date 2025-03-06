import CheckinModal from "@/components/organisms/CheckinModal";
import { Button, Container, Flex, Heading, Stack, VStack } from "@chakra-ui/react";
import Cookies from "js-cookie";
import Head from "next/head";
import { useCallback, useState } from "react";

export default function Home() {
  const [modal, setModal] = useState({
    state: false,
    title: ""
  });

  const logout = useCallback(() => {
    Cookies.remove("token");
    window && window.location.reload();
  }, [])

  return (
    <>
      <Head>
        <title>Homepage | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>

      <Container w={{ base: "360px", md: "400px" }}>
        <VStack h="calc(100vh - 20vh)" justify="center" alignItems="center">
          <Heading>Choose Event</Heading>
          <Stack flexDir={{ base: "column", md: "row" }}>
            <Flex
              cursor="pointer"
              justify="center"
              alignItems="center"
              boxSize={{ base: "15rem", md: "10rem" }}
              border={{ base: "black 1px solid", _dark: "white 1px solid" }}
              borderRadius="2xl"
              onClick={() => setModal({
                state: !modal.state,
                title: "Event 1"
              })}
            >
              Event 1
            </Flex>
            <Flex
              cursor="pointer"
              justify="center"
              alignItems="center"
              boxSize={{ base: "15rem", md: "10rem" }}
              border={{ base: "black 1px solid", _dark: "white 1px solid" }}
              borderRadius="2xl"
              onClick={() => setModal({
                state: !modal.state,
                title: "Event 2"
              })}
            >
              Event 2
            </Flex>
          </Stack>
          <Button mt="1rem" w="100%" onClick={logout}>Logout</Button>
        </VStack>
      </Container>
      <CheckinModal title={modal.title} isOpen={modal.state} setOpen={(e) => setModal({
        state: e,
        title: modal.title
      })} />
    </>
  );
}
