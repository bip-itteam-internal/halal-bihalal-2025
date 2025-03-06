import { Button, Container, Flex, Heading, HStack, VStack } from "@chakra-ui/react";
import Head from "next/head";
import Cookies from "js-cookie";
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
          <HStack>
            <Flex
              cursor="pointer"
              justify="center"
              alignItems="center"
              boxSize="10rem"
              border="white 1px solid"
              borderRadius="lg"
            >
              Event 1
            </Flex>
            <Flex
              cursor="pointer"
              justify="center"
              alignItems="center"
              boxSize="10rem"
              border="white 1px solid"
              borderRadius="lg"
            >
              Event 2
            </Flex>
          </HStack>
          <Button w="100%" onClick={logout}>Logout</Button>
        </VStack>
      </Container>
    </>
  );
}
