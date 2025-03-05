import { get_data } from "@/components/helpers/supabase";
import { PaginationItems, PaginationNextTrigger, PaginationPrevTrigger, PaginationRoot } from "@/components/ui/pagination";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Flex, HStack, IconButton, Input, Spinner, Stack, Table } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { IData } from "../mock/mock_data";

export default function TableParticipant() {
  const [data, setData] = useState<IData[]>([])

  useEffect(() => {
    (async () => {
      const { data, error } = await get_data();
      if (error)
        toaster.create({
          description: error.message,
          type: "error",
        })

      if (data)
        setData(data)
    })()
  }, [])

  return (
    <>
      {
        data === null || data.length <= 0 && (
          <Flex h="100vh" justifyContent="center" alignItems="center">
            <Spinner size="md" />
          </Flex>
        )
      }

      {
        data && data.length > 0 && (
          <>
            <Input mb={5} placeholder="Search..." />
            <Table.Root size="sm" interactive>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>No.</Table.ColumnHeader>
                  <Table.ColumnHeader>Nama</Table.ColumnHeader>
                  <Table.ColumnHeader>Phone</Table.ColumnHeader>
                  <Table.ColumnHeader>Email</Table.ColumnHeader>
                  <Table.ColumnHeader>Department</Table.ColumnHeader>
                  <Table.ColumnHeader>Shirt Size</Table.ColumnHeader>
                  <Table.ColumnHeader>Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.map((item, index) => (
                  <Table.Row key={item.phone}>
                    <Table.Cell>{++index}</Table.Cell>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>{item.phone}</Table.Cell>
                    <Table.Cell>{item.email}</Table.Cell>
                    <Table.Cell>{item.department}</Table.Cell>
                    <Table.Cell>{item.shirt_size}</Table.Cell>
                    <Table.Cell>
                      <IconButton aria-label="Edit" onClick={() => {
                        toaster.create({
                          description: "Edit",
                          type: "info",
                          duration: 2000
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
                count={10}
                pageSize={2}
                defaultPage={1}
                onPageChange={(e) => {
                  toaster.create({
                    description: `Go to ${e.page}`,
                    type: "info"
                  })
                }}
              >
                <HStack>
                  <PaginationPrevTrigger />
                  <PaginationItems />
                  <PaginationNextTrigger />
                </HStack>
              </PaginationRoot>
            </Stack>
            <Toaster />
          </>
        )
      }
    </>
  )
}