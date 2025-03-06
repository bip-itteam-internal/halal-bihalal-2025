import { Button, Container, Flex, Heading, Stack, VStack } from "@chakra-ui/react";
import Cookies from "js-cookie";
import Head from "next/head";
import { useCallback } from "react";

export default function Home() {

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
            >
              Event 2
            </Flex>
          </Stack>
          <Button mt="1rem" w="100%" onClick={logout}>Logout</Button>
        </VStack>
      </Container>
    </>
  );
}
