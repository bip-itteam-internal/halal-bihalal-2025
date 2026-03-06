"use client";

import Link from "next/link";
import { MoveRight, Ticket, UserCheck, ShieldCheck, Sparkles, Calendar } from "lucide-react";
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  Stack, 
  HStack, 
  VStack, 
  SimpleGrid, 
  Badge, 
  Icon, 
  Circle
} from "@chakra-ui/react";

export default function Home() {
  const bgGradient = {
    base: "radial-gradient(circle at 0% 0%, #ecfdf5 0%, transparent 50%), radial-gradient(circle at 100% 100%, #fffbeb 0%, transparent 50%)",
    _dark: "radial-gradient(circle at 0% 0%, #064e3b 0%, transparent 50%), radial-gradient(circle at 100% 100%, #451a03 0%, transparent 50%)"
  };

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      bg={{ base: "gray.50", _dark: "gray.900" }}
      position="relative" 
      overflow="hidden"
      backgroundImage={bgGradient}
    >
      <Container maxW="6xl" py={20} textAlign="center" zIndex={10}>
        <VStack gap={10}>
          <HStack 
            bg={{ base: "white", _dark: "gray.800" }}
            boxShadow="xl" 
            borderWidth="1px" 
            borderColor={{ base: "gray.100", _dark: "gray.700" }}
            px={5} 
            py={2} 
            borderRadius="full" 
            gap={3}
            transition="all 0.3s"
            _hover={{ transform: "scale(1.05)" }}
          >
            <Badge colorPalette="green" variant="solid" borderRadius="full" px={3}>
              LIVE
            </Badge>
            <HStack gap={2}>
              <Icon as={Calendar} w={4} h={4} color={{ base: "gray.600", _dark: "gray.400" }} />
              <Text fontSize="sm" fontWeight="black" color={{ base: "gray.600", _dark: "gray.400" }}>
                20 June 2026 • 16:30 WIB
              </Text>
            </HStack>
            <Box w={1} h={1} bg="gray.300" borderRadius="full" />
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              color="gray.400" 
              textTransform="uppercase" 
              letterSpacing="widest"
              px={2}
            >
              Bharata Group
            </Text>
          </HStack>

          <Box>
            <Heading 
              fontSize={{ base: "6xl", md: "8xl" }} 
              fontWeight="black" 
              letterSpacing="tighter" 
              lineHeight="0.9"
              color={{ base: "gray.900", _dark: "white" }}
              mb={8}
            >
              Halal Bihalal <Box as="span" color="emerald.500">Bharata Group</Box> <br />
              Spesial Konser <Box as="span" borderBottom="8px solid" borderColor="amber.400" pb={2}>Wali Band</Box> 2026
            </Heading>
            
            <Text 
              maxW="2xl" 
              mx="auto" 
              fontSize={{ base: "xl", md: "2xl" }} 
              fontWeight="medium" 
              color="gray.400" 
              lineHeight="relaxed"
              fontStyle="italic"
            >
              Next-generation event invitation system. <br />
              Seamless QR Check-in, Real-time Analytics, and Instant E-Ticketing.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} w="full" maxW="5xl">
            {/* External Registration */}
            <Link href="/register/halal-bihalal-2025" passHref legacyBehavior>
              <Box 
                as="a"
                bg={{ base: "white", _dark: "gray.800" }}
                p={10}
                borderRadius="3.5rem"
                boxShadow="2xl"
                transition="all 0.5s"
                _hover={{ transform: "scale(1.03)", boxShadow: "2xl", textDecoration: "none" }}
                _active={{ transform: "scale(0.95)" }}
                position="relative"
                overflow="hidden"
                h="full"
                display="block"
              >
                <Box position="absolute" top={0} right={0} p={6} opacity={0.1}>
                  <Icon as={Sparkles} w={20} h={20} color="emerald.500" />
                </Box>
                <VStack gap={8} textAlign="center" h="full" justify="space-between">
                  <Circle size="20" bg="emerald.100" ring="8px" ringColor="emerald.50" _dark={{ bg: "emerald.900", ringColor: "emerald.800/20" }}>
                    <Icon as={Ticket} w={10} h={10} color="emerald.600" />
                  </Circle>
                  <Box>
                    <Heading size="md" fontWeight="black" mb={3} color={{ base: "gray.900", _dark: "white" }}>
                      Registrasi Umum
                    </Heading>
                    <Text fontSize="sm" fontWeight="medium" color="gray.400" fontStyle="italic">
                      Dapatkan E-Ticket instan untuk tamu eksternal melalui sistem digital.
                    </Text>
                  </Box>
                  <Button 
                    w="full" 
                    h={16} 
                    borderRadius="1.8rem" 
                    size="lg" 
                    colorPalette="emerald"
                    fontWeight="black" 
                    letterSpacing="widest"
                    boxShadow="xl"
                  >
                    GET TICKET <Icon as={MoveRight} ml={3} />
                  </Button>
                </VStack>
              </Box>
            </Link>

            {/* Committee Mode / Scanner */}
            <Link href="/scanner" passHref legacyBehavior>
              <Box 
                as="a"
                bg="gray.900"
                p={10}
                borderRadius="3.5rem"
                boxShadow="2xl"
                transition="all 0.5s"
                _hover={{ transform: "scale(1.03)", textDecoration: "none" }}
                _active={{ transform: "scale(0.95)" }}
                position="relative"
                overflow="hidden"
                h="full"
                display="block"
              >
                <Box position="absolute" top={0} right={0} p={6} opacity={0.1}>
                  <Icon as={UserCheck} w={20} h={20} color="white" />
                </Box>
                <VStack gap={8} textAlign="center" h="full" justify="space-between">
                  <Circle size="20" bg="whiteAlpha.100" ring="8px" ringColor="whiteAlpha.50">
                    <Icon as={UserCheck} w={10} h={10} color="white" />
                  </Circle>
                  <Box>
                    <Heading size="md" fontWeight="black" mb={3} color="white">
                      Scan Check-in
                    </Heading>
                    <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.400" fontStyle="italic">
                      Panel khusus panitia untuk verifikasi QR Code tamu siang & malam.
                    </Text>
                  </Box>
                  <Button 
                    w="full" 
                    h={16} 
                    borderRadius="1.8rem" 
                    size="lg" 
                    variant="outline"
                    color="white"
                    borderColor="whiteAlpha.200"
                    _hover={{ bg: "whiteAlpha.100" }}
                    fontWeight="black" 
                    letterSpacing="widest"
                  >
                    OPEN SCANNER <Icon as={MoveRight} ml={3} />
                  </Button>
                </VStack>
              </Box>
            </Link>

            {/* Admin Dashboard */}
            <Link href="/dashboard" passHref legacyBehavior>
              <Box 
                as="a"
                bg={{ base: "white", _dark: "gray.800" }}
                p={10}
                borderRadius="3.5rem"
                boxShadow="2xl"
                transition="all 0.5s"
                _hover={{ transform: "scale(1.03)", textDecoration: "none" }}
                _active={{ transform: "scale(0.95)" }}
                position="relative"
                overflow="hidden"
                h="full"
                display="block"
              >
                <Box position="absolute" top={0} right={0} p={6} opacity={0.1}>
                  <Icon as={ShieldCheck} w={20} h={20} color={{ base: "gray.900", _dark: "white" }} />
                </Box>
                <VStack gap={8} textAlign="center" h="full" justify="space-between">
                  <Circle size="20" bg="gray.100" ring="8px" ringColor="gray.50" _dark={{ bg: "gray.700", ringColor: "gray.600/20" }}>
                    <Icon as={ShieldCheck} w={10} h={10} color={{ base: "gray.900", _dark: "white" }} />
                  </Circle>
                  <Box>
                    <Heading size="md" fontWeight="black" mb={3} color={{ base: "gray.900", _dark: "white" }}>
                      Dashboard
                    </Heading>
                    <Text fontSize="sm" fontWeight="medium" color="gray.400" fontStyle="italic">
                      Akses analitik real-time, manajemen tamu, dan sistem doorprize.
                    </Text>
                  </Box>
                  <Button 
                    w="full" 
                    h={16} 
                    borderRadius="1.8rem" 
                    size="lg" 
                    variant="outline"
                    borderColor={{ base: "gray.200", _dark: "gray.600" }}
                    fontWeight="black" 
                    letterSpacing="widest"
                  >
                    ADMIN PANEL <Icon as={MoveRight} ml={3} />
                  </Button>
                </VStack>
              </Box>
            </Link>
          </SimpleGrid>

          <Text 
            mt={20} 
            fontSize="10px" 
            fontWeight="black" 
            textTransform="uppercase" 
            letterSpacing="1em" 
            color="gray.300"
          >
            Bharata International Panel • Automation System 2025
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
