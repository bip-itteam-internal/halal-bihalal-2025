import TableParticipant from "@/components/organisms/TableParticipant";
import { Box, Container, Heading, Tabs } from "@chakra-ui/react";
import Head from "next/head";
import { LuPlus, LuUser } from "react-icons/lu";

export default function Home() {

  return (
    <>
      <Head>
        <title>Dashboard | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>
      <Container mt={10}>

        <Heading fontSize="4xl" mb={8} textAlign="center">DASHBOARD</Heading>

        <Tabs.Root justify="center" defaultValue="participants" lazyMount>
          <Tabs.List>
            <Tabs.Trigger value="participants">
              <LuUser />
              Participants
            </Tabs.Trigger>
            <Tabs.Trigger value="adds">
              <LuPlus />
              New
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="participants">
            <Box pt={5}>
              <TableParticipant />
            </Box>
          </Tabs.Content>
          <Tabs.Content value="adds">
            <Box pt={5}>
              Manage your tasks for freelancers
            </Box>
          </Tabs.Content>
        </Tabs.Root>


      </Container>
    </>
  )
}