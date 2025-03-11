import { Field } from "@/components/ui/field";
import {
  Button,
  Container,
  Flex,
  Group,
  Heading,
  Input,
  InputAddon
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { Toaster, toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useEffect } from "react";

const formSchema = z.object({
  phone: z.string({ message: "Nomor telepon jangan kosong ya" }).min(1),
})

type FormValues = z.infer<typeof formSchema>

export default function UserLogin() {
  const router = useRouter()

  const {
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
    register,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = handleSubmit(async ({ phone }) => {
    const result = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: `62${phone}`
      })
    })

    const { token, message } = await result.json()

    if (!result.ok) {
      console.error({ result })
      toaster.create({
        description: `Error: ${message}`,
        type: "error",
        duration: 2000
      })
    }

    if (result.ok) {
      Cookies.set("token", token, { expires: 14, path: "/" })
      router.push("/")
    }
  })

  useEffect(() => {
    if (Cookies.get("token")) router.replace("/user")
  }, [router])

  return (
    <>
      <Head>
        <title>Login | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>

      <Flex flexDir="column" h={{ base: "calc(100vh - 30vh)", md: "calc(100vh - 20vh)" }} justifyContent="center" alignItems="center">
        <Heading size="3xl" mb={10}>Login</Heading>
        <Container width={{ base: "85%", lg: "30%" }}>
          <form onSubmit={onSubmit}>
            <Field
              mb={10}
              invalid={!!errors.phone}
              errorText={errors.phone?.message}>
              <Group attached w="100%">
                <InputAddon
                  border={{ base: "black 1px solid", _dark: "white 1px solid" }}
                >62</InputAddon>
                <Input {...register("phone")}
                  border={{ base: "black 1px solid", _dark: "white 1px solid" }}
                  borderRadius="md"
                  inputMode="numeric"
                  placeholder="No. Telephone" />
              </Group>
            </Field>

            <Field>
              <Button
                w="100%"
                type="submit"
                loading={isLoading || isSubmitting}
                loadingText="Logging in"
              >Login</Button>
            </Field>
          </form>
          <Toaster />
        </Container>
      </Flex>
    </>
  )
}