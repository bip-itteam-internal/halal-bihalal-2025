import { IData } from "@/components/mock/mock_data";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot
} from "@/components/ui/pagination";
import {
  Box,
  Group,
  Heading,
  HStack,
  IconButton,
  Input,
  Spinner,
  Stack,
  Table,
  Text,
  VStack
} from "@chakra-ui/react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { FaBookQuran } from "react-icons/fa6";
import { ImMusic } from "react-icons/im";
import { Tooltip } from "@/components/ui/tooltip";
import Cookies from "js-cookie";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";

const PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 350; // 350ms delay

interface IEditThis {
  populatedData: (data: IData) => void
}

export default function TableParticipant({ populatedData }: IEditThis) {
  const router = useRouter();
  const [data, setData] = useState<IData[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);

      const baseURL = `${window.location.protocol}//${window.location.host}`
      const url = new URL(`${baseURL}/api/admin/participant`)

      if (debouncedSearchTerm)
        url.searchParams.append("search", debouncedSearchTerm)

      if (page)
        url.searchParams.append("page", page.toString())

      url.searchParams.append("page_size", PAGE_SIZE.toString())

      const token = Cookies.get("at");

      if (!token) return;

      const burp = await fetch(url, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!burp.ok) {
        toaster.create({
          description: `Error: ${burp.statusText}`,
          type: "error"
        })
        setLoading(false)
        return;
      }

      const { data } = await burp.json()
      const { participants, total } = data

      if (burp && data)
        setData(participants)

      if (burp && total)
        setTotalCount(total)

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

  const checkin = useCallback(async (participant_id: number, event_id: number) => {
    if (participant_id === undefined)
      toaster.create({
        description: `Error: Unknown Participan ID ${participant_id}`,
        type: "error",
        duration: 2000
      })

    setLoading(true);

    const token = Cookies.get("at")
    const response = await fetch(`/api/admin/attendance`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        attendance: {
          participant_id: participant_id,
          event_id: event_id,
          status: "Present"
        }
      })
    })

    if (!response.ok) {
      setLoading(false)
      toaster.create({
        description: `Error: ${response.statusText}`,
        type: "error",
        duration: 2000
      })
    }

    if (response.ok) {
      setLoading(false);
      router.reload();
    }
  }, [router])

  return (
    <>
      {
        loading && (
          <Spinner
            color="primary"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            position="absolute"
            size="lg" />
        )
      }

      <VStack>
        <Input
          mb={5}
          _placeholder={{ color: "cancel", opacity: "0.5" }}
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          color="cancel" />
        {
          data && data.length > 0 && (
            <>
              <Table.Root size="sm" interactive>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>#</Table.ColumnHeader>
                    <Table.ColumnHeader>Nama</Table.ColumnHeader>
                    <Table.ColumnHeader>Phone</Table.ColumnHeader>
                    <Table.ColumnHeader>Shirt Size</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.map((item, index) => (
                    <Table.Row key={item.phone}>
                      <Table.Cell>{(page - 1) * PAGE_SIZE + index + 1}</Table.Cell>
                      <Table.Cell>{item.name}</Table.Cell>
                      <Table.Cell>{item.phone}</Table.Cell>
                      <Table.Cell>{item.shirt_size}</Table.Cell>
                      <Table.Cell>
                        <>
                          <Box as="ul" listStyleType="circle">
                            {
                              item.attendance?.map((x) => (
                                <li key={x.event_id}>
                                  <Text>{x.event_id} - {x.status}</Text>
                                </li>
                              ))
                            }
                          </Box>
                        </>
                      </Table.Cell>
                      <Table.Cell>
                        <Group>
                          <Tooltip content="CheckIn Tausyah">
                            <IconButton aria-label="CheckIn 1" onClick={() => {
                              checkin(Number(item.id), 1)
                            }}>
                              <FaBookQuran />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="CheckIn Live Concert">
                            <IconButton aria-label="CheckIn 2" onClick={() => {
                              checkin(Number(item?.id), 2)
                            }}>
                              <ImMusic />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Edit">
                            <IconButton aria-label="Edit" onClick={() => {
                              populatedData({
                                id: item.id,
                                phone: item.phone,
                                name: item.name,
                                shirt_size: item.shirt_size
                              })
                            }}>
                              <FaPencilAlt />
                            </IconButton>
                          </Tooltip>
                        </Group>
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
                <Heading textAlign="center" mt="1rem">Total peserta: {totalCount}</Heading>

              </Stack>
            </>
          )
        }
      </VStack>
      <Toaster />

      {
        data && data.length === 0 && (
          <VStack>
            <Text fontStyle="italic" color="cancel">Empty data</Text>
          </VStack>
        )
      }

    </>
  )
}