import AddParticipantForm from "@/components/organisms/AddParticipantForm";
import TableParticipant from "@/components/organisms/TableParticipant";
import { Box, Button, Container, Heading, Tabs } from "@chakra-ui/react";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { LuPlus, LuUser } from "react-icons/lu";
import Cookies from "js-cookie"
import { useRouter } from "next/router";
import EditParticipantForm from "@/components/organisms/EditParticipantForm";
import { IData } from "@/components/mock/mock_data";

const TABS_LIST = ["participants", "adds"]

export default function Home() {
  const [tab, setTab] = useState<string | null>(TABS_LIST[0])
  const [populatedData, setPopulatedData] = useState<IData>()
  const router = useRouter()

  const logout = useCallback(() => {
    Cookies.remove("at", { path: "/admin" });
    router.reload();
  }, [router])

  useEffect(() => {
    if (!Cookies.get("at")) router.replace("/admin/login", undefined, { shallow: false })
  }, [router])

  return (
    <>
      <Head>
        <title>Dashboard | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>
      <Container mt={10}>

        <Heading fontSize="4xl" mb={8} textAlign="center">DASHBOARD</Heading>

        <Button
          position="absolute"
          top="0"
          right="2rem"
          w="4rem"
          h="2rem"
          onClick={logout}
        >Logout</Button>

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
              {populatedData ? "Edit" : "New"}
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value={TABS_LIST[0]}>
            <Box pt={5}>
              <TableParticipant populatedData={(data) => {
                setPopulatedData(data)
                setTab(TABS_LIST[1])
              }} />
            </Box>
          </Tabs.Content>
          <Tabs.Content value={TABS_LIST[1]}>
            <Box pt={5}>
              {
                !populatedData && (
                  <AddParticipantForm goToList={() => setTab(TABS_LIST[0])} key="Add" />
                )
              }

              {
                populatedData && (
                  <EditParticipantForm
                    goToList={() => setTab(TABS_LIST[0])}
                    key="Edit"
                    populatedData={populatedData}
                    clear={() => setPopulatedData(undefined)} />
                )
              }
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Container>
    </>
  )
}