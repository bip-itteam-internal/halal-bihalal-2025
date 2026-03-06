"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight,
  UserCheck,
  Ticket,
  Timer
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Guest, Checkin } from "@/types";
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Stack, 
  HStack, 
  VStack, 
  SimpleGrid, 
  Badge, 
  Input, 
  Flex,
  Table,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { InputGroup } from "@/components/ui/input-group";
import { StatsCard } from "@/components/shared/stats-card";
import { Sidebar } from "@/components/layout/sidebar";

interface GuestWithCheckins extends Guest {
  checkins: Checkin[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    internal: 0,
    external: 0,
    checkedIn: 0,
    quotaLeft: 0,
  });
  
  const [guests, setGuests] = useState<GuestWithCheckins[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [regStatus, setRegStatus] = useState<'open' | 'closed'>('open');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: event } = await supabase.from('events').select('*').single();
      if (event) {
        setRegStatus(event.public_reg_status);
      }

      const { data: allGuests, error } = await supabase
        .from('guests')
        .select(`*, checkins(*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!allGuests) return;

      setGuests(allGuests as GuestWithCheckins[]);

      const total = allGuests.length;
      const internal = allGuests.filter(g => g.guest_type === 'internal').length;
      const external = allGuests.filter(g => g.guest_type === 'external').length;
      const checkedIn = allGuests.filter(g => g.checkins && g.checkins.length > 0).length;
      
      setStats({
        total,
        internal,
        external,
        checkedIn,
        quotaLeft: event ? event.external_quota - external : 0
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRegStatus = async () => {
    const newStatus = regStatus === 'open' ? 'closed' : 'open';
    const { error } = await supabase
      .from('events')
      .update({ public_reg_status: newStatus })
      .eq('name', 'Halal Bihalal 2025');

    if (!error) setRegStatus(newStatus);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredGuests = guests.filter(g => 
    g.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.company && g.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Flex minH="100vh" bg={{ base: "gray.50", _dark: "gray.900" }}>
      <Sidebar />

      <Box flex="1" p={{ base: 8, lg: 16 }} overflowY="auto">
        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={8} mb={16}>
          <Box>
            <Heading fontSize="5xl" fontWeight="black" letterSpacing="tighter" mb={3} color={{ base: "gray.900", _dark: "white" }}>
              Event Analytics
            </Heading>
            <Text color="gray.500" fontWeight="medium" fontSize="lg">
              Halal Bihalal 2025 & Festival Letto
            </Text>
          </Box>

          <HStack bg="white" _dark={{ bg: "gray.800" }} p={3} pr={6} borderRadius="2xl" boxShadow="sm" gap={6} borderWidth="1px" borderColor={{ base: "gray.100", _dark: "gray.700" }}>
            <Box px={6} py={2} borderEndWidth="1px" borderColor={{ base: "gray.100", _dark: "gray.700" }}>
              <Text fontSize="10px" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="0.2em" mb={1}>
                Public Reg
              </Text>
              <Badge colorPalette={regStatus === 'open' ? 'green' : 'red'} variant="solid" height="6" borderRadius="md">
                {regStatus.toUpperCase()}
              </Badge>
            </Box>
            <Button 
              colorPalette={regStatus === 'open' ? 'red' : 'blue'}
              size="sm"
              onClick={toggleRegStatus}
              height="12"
              px={6}
              borderRadius="xl"
            >
              {regStatus === 'open' ? "Tutup Registrasi" : "Buka Registrasi"}
            </Button>
          </HStack>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={8} mb={16}>
          <StatsCard icon={<Users />} label="Total Tamu" value={stats.total} color="blue" />
          <StatsCard icon={<UserCheck />} label="Hadir (Cek-in)" value={stats.checkedIn} color="emerald" />
          <StatsCard icon={<Ticket />} label="Sisa Kuota" value={stats.quotaLeft} color="amber" />
          <StatsCard icon={<Timer />} label="Intern / Ekstern" value={`${stats.internal} / ${stats.external}`} color="indigo" />
        </SimpleGrid>

        <Box bg="white" _dark={{ bg: "gray.800" }} borderRadius="3rem" boxShadow="2xl" overflow="hidden" borderWidth="1px" borderColor={{ base: "gray.100", _dark: "gray.700" }}>
          <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} p={10} borderBottomWidth="1px" borderColor={{ base: "gray.50", _dark: "gray.700" }} gap={6}>
            <Heading fontSize="2xl" fontWeight="bold">Daftar Tamu</Heading>
            <HStack gap={4} w={{ base: "full", md: "auto" }}>
              <InputGroup 
                w={{ base: "full", md: "80" }} 
                startElement={<Search size={16} color="gray" />}
              >
                <Input 
                  placeholder="Cari nama atau perusahaan..." 
                  h="12" 
                  bg={{ base: "gray.50", _dark: "gray.700" }}
                  border="none"
                  borderRadius="xl"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <IconButton 
                aria-label="Filter"
                h="12" 
                w="12" 
                borderRadius="xl"
                variant="outline"
              >
                <Filter size={16} />
              </IconButton>
            </HStack>
          </Stack>

          <Box overflowX="auto">
            <Table.Root variant="line">
              <Table.Header bg="gray.50" _dark={{ bg: "gray.700" }}>
                <Table.Row>
                  <Table.ColumnHeader px={10} py={6} fontSize="xs" fontWeight="bold">Tamu</Table.ColumnHeader>
                  <Table.ColumnHeader px={10} py={6} fontSize="xs" fontWeight="bold">Kategori</Table.ColumnHeader>
                  <Table.ColumnHeader px={10} py={6} fontSize="xs" fontWeight="bold">Instansi</Table.ColumnHeader>
                  <Table.ColumnHeader px={10} py={6} fontSize="xs" fontWeight="bold">Check-in</Table.ColumnHeader>
                  <Table.ColumnHeader px={10} py={6} fontSize="xs" fontWeight="bold" textAlign="right">Aksi</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} p={32} textAlign="center">
                      <VStack gap={4}>
                        <Spinner size="xl" color="blue.500" />
                        <Text fontWeight="bold" color="gray.300" fontSize="xl">Diving into data...</Text>
                      </VStack>
                    </Table.Cell>
                  </Table.Row>
                ) : filteredGuests.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} p={32} textAlign="center">
                      <Text fontWeight="medium" color="gray.400">Belum ada tamu yang terdaftar.</Text>
                    </Table.Cell>
                  </Table.Row>
                ) : filteredGuests.map((guest) => (
                  <Table.Row 
                    key={guest.id} 
                    cursor="pointer"
                    _hover={{ bg: { base: "gray.50", _dark: "gray.700/30" } }}
                    transition="background 0.2s"
                  >
                    <Table.Cell px={10} py={7}>
                      <Box>
                        <Text fontWeight="bold" fontSize="lg" color="gray.900" _dark={{ color: "white" }}>{guest.full_name}</Text>
                        <Text fontSize="xs" color="gray.400" fontWeight="bold">{guest.phone || 'No WhatsApp'}</Text>
                      </Box>
                    </Table.Cell>
                    <Table.Cell px={10} py={7}>
                      <Badge colorPalette={guest.guest_type === 'internal' ? 'blue' : 'purple'} variant="solid" borderRadius="full">
                        {guest.guest_type}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell px={10} py={7}>
                      <Text fontSize="sm" fontWeight="bold" color="gray.500" textTransform="uppercase">
                        {guest.company || guest.department || 'Personal'}
                      </Text>
                    </Table.Cell>
                    <Table.Cell px={10} py={7}>
                      <HStack gap={2}>
                        {(['siang', 'malam'] as const).map(s => {
                          const hasChecked = guest.checkins?.some((c: Checkin) => c.session_type === s);
                          return (
                            <Badge key={s} colorPalette={hasChecked ? 'green' : 'gray'} variant={hasChecked ? 'solid' : 'outline'} borderRadius="lg" h="6" px={2} textTransform="lowercase" fontWeight="medium">
                              {s}
                            </Badge>
                          );
                        })}
                      </HStack>
                    </Table.Cell>
                    <Table.Cell px={10} py={7} textAlign="right">
                      <Box 
                        display="inline-block" 
                        p={3} 
                        borderRadius="2xl" 
                        transition="all 0.2s"
                        _hover={{ bg: { base: "white", _dark: "gray.700" }, boxShadow: "md", color: "blue.500" }}
                      >
                        <IconButton aria-label="Detail" variant="ghost" rounded="full">
                          <ChevronRight size={24} color="gray" />
                        </IconButton>
                      </Box>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
