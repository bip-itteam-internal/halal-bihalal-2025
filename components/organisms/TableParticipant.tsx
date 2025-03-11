import { get_participant_paging } from "@/components/helpers/supabase";
import { IData } from "@/components/mock/mock_data";
import { PaginationItems, PaginationNextTrigger, PaginationPrevTrigger, PaginationRoot } from "@/components/ui/pagination";
import { Box, Center, HStack, IconButton, Input, Spinner, Stack, Table, Text, VStack } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";

const PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 350; // 350ms delay

interface IEditThis {
  populatedData: (data: IData) => void
}

export default function TableParticipant({ populatedData }: IEditThis) {
  const [data, setData] = useState<IData[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);

      const burp = await get_participant_paging({ page, debouncedSearchTerm, page_size: PAGE_SIZE });

      if (burp && burp.data)
        setData(burp.data)

      if (burp && burp.count)
        setTotalCount(burp.count)

      setLoading(false)
    })()
  }, [page, debouncedSearchTerm])

  // Debounce logic: update debouncedSearchTerm after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler); // Cleanup timeout if user types again
  }, [searchTerm]);

  // Handle search input change
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <>
      {
        loading && (
          <Box pos="absolute" inset="0" bg="bg/80">
            <Center h="full">
              <Spinner color="teal.500" size="lg" />
            </Center>
          </Box>
        )
      }

      <VStack>
        <Input mb={5} placeholder="Search..." value={searchTerm} onChange={handleSearch} />
        {
          data && data.length > 0 && (
            <>
              <Table.Root size="sm" interactive>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>#</Table.ColumnHeader>
                    <Table.ColumnHeader>Nama</Table.ColumnHeader>
                    <Table.ColumnHeader>Phone</Table.ColumnHeader>
                    <Table.ColumnHeader>Email</Table.ColumnHeader>
                    <Table.ColumnHeader>Shirt Size</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.map((item, index) => (
                    <Table.Row key={item.phone}>
                      <Table.Cell>{(page - 1) * PAGE_SIZE + index + 1}</Table.Cell>
                      <Table.Cell>{item.name}</Table.Cell>
                      <Table.Cell>{item.phone}</Table.Cell>
                      <Table.Cell>{item.email}</Table.Cell>
                      <Table.Cell>{item.shirt_size}</Table.Cell>
                      <Table.Cell>
                        <IconButton aria-label="Edit" onClick={() => {
                          populatedData({
                            id: item.id,
                            phone: item.phone,
                            name: item.name,
                            email: item.email,
                            shirt_size: item.shirt_size
                          })
                        }}>
                          <FaPencilAlt />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              <Stack>
                <PaginationRoot
                  count={totalCount}
                  pageSize={PAGE_SIZE}
                  defaultPage={page}
                  onPageChange={(e) => {
                    setPage(e.page)
                  }}
                >
                  <HStack>
                    <PaginationPrevTrigger />
                    <PaginationItems />
                    <PaginationNextTrigger />
                  </HStack>
                </PaginationRoot>
              </Stack>
            </>
          )
        }
      </VStack>

      {
        data && data.length === 0 && (
          <VStack>
            <Text fontStyle="italic">Empty data</Text>
          </VStack>
        )
      }

    </>
  )
}