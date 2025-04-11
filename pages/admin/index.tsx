import AddParticipantForm from "@/components/organisms/AddParticipantForm";
import TableParticipant from "@/components/organisms/TableParticipant";
import { Box, Container, Heading, Tabs, Text } from "@chakra-ui/react";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { LuPlus, LuUser, LuLogOut } from "react-icons/lu";
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
      <Container pt="3rem">

        <Heading
          fontSize="4xl"
          mb={8}
          textAlign="center"
          color="cancel">DASHBOARD PESERTA</Heading>

        <Tabs.Root
          justify="center"
          lazyMount
          unmountOnExit
          value={tab}
          colorPalette="green"
          onValueChange={(e) => setTab(e.value)}>
          <Tabs.List>
            <Tabs.Trigger value={TABS_LIST[0]} color="cancel">
              <LuUser />
              Participants
            </Tabs.Trigger>
            <Tabs.Trigger value={TABS_LIST[1]} color="cancel">
              <LuPlus />
              {populatedData ? "Edit" : "New"}
            </Tabs.Trigger>
            <Tabs.Trigger value="-1" onClick={logout} color="cancel">
              <LuLogOut />
              Logout
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
          <Tabs.Content value="-1">
            <Text textAlign="center" color="cancel">Loading...</Text>
          </Tabs.Content>
        </Tabs.Root>
      </Container>
    </>
  )
}