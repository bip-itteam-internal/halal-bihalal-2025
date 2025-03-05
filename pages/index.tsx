import { Container, Flex, Heading, HStack, Spinner, VStack } from "@chakra-ui/react";
import Head from "next/head";

export default function Home() {

  return (
    <>
      <Head>
        <title>Homepage | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>

      <Container>
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
        </VStack>
      </Container>
    </>
  );
}
