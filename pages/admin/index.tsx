import AddParticipantForm from "@/components/organisms/AddParticipantForm";
import TableParticipant from "@/components/organisms/TableParticipant";
import { Box, Container, Heading, Tabs, Text } from "@chakra-ui/react";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { LuPlus, LuUser, LuLogOut } from "react-icons/lu";
import { CiExport } from "react-icons/ci";
import Cookies from "js-cookie"
import { useRouter } from "next/router";
import EditParticipantForm from "@/components/organisms/EditParticipantForm";
import { IData } from "@/components/mock/mock_data";
import { Toaster, toaster } from "@/components/ui/toaster";

const TABS_LIST = ["participants", "adds"]

export default function Home() {
  const [tab, setTab] = useState<string | null>(TABS_LIST[0])
  const [populatedData, setPopulatedData] = useState<IData>()
  const router = useRouter()

  const logout = useCallback(() => {
    Cookies.remove("at", { path: "/admin" });
    router.reload();
  }, [router])

  const exportCSV = useCallback(async () => {
    const token = Cookies.get("at")

    if (!token) {
      console.error("ERROR: TOKEN EMPTY")
    }

    const response = await fetch("/api/admin/export", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      toaster.error({
        description: `ERROR: ${response.status}`
      })
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Attempt to get filename from headers
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'participants.csv';

    if (contentDisposition) {
      const match = /filename="?([^"]+)"?/.exec(contentDisposition);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    // Assuming CSV is returned as text
    const csvData = await response.text();

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
    setTab(TABS_LIST[0])
  }, [])

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
            <Tabs.Trigger value="-1" onClick={exportCSV} color="cancel">
              <CiExport />
              Export
            </Tabs.Trigger>
            <Tabs.Trigger value="-2" onClick={logout} color="cancel">
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
        <Toaster />
      </Container>
    </>
  )
}