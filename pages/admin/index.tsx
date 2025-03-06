import AddParticipantForm from "@/components/organisms/AddParticipantForm";
import TableParticipant from "@/components/organisms/TableParticipant";
import { Box, Container, Heading, Tabs } from "@chakra-ui/react";
import Head from "next/head";
import { useState } from "react";
import { LuPlus, LuUser } from "react-icons/lu";

const TABS_LIST = ["participants", "adds"]

export default function Home() {

  const [tab, setTab] = useState<string | null>(TABS_LIST[1])

  return (
    <>
      <Head>
        <title>Dashboard | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>
      <Container mt={10}>

        <Heading fontSize="4xl" mb={8} textAlign="center">DASHBOARD</Heading>

        <Tabs.Root
          justify="center"
          lazyMount
          unmountOnExit
          value={tab}
          onValueChange={(e) => setTab(e.value)}>
          <Tabs.List>
            <Tabs.Trigger value={TABS_LIST[0]}>
              <LuUser />
              Participants
            </Tabs.Trigger>
            <Tabs.Trigger value={TABS_LIST[1]}>
              <LuPlus />
              New
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value={TABS_LIST[0]}>
            <Box pt={5}>
              <TableParticipant />
            </Box>
          </Tabs.Content>
          <Tabs.Content value={TABS_LIST[1]}>
            <Box pt={5}>
              <AddParticipantForm goToList={() => setTab(TABS_LIST[0])} />
            </Box>
          </Tabs.Content>
        </Tabs.Root>

      </Container>
    </>
  )
}