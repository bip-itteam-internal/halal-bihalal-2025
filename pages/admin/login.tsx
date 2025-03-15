import { Field } from "@/components/ui/field";
import {
  Button,
  Container,
  Flex,
  Group,
  Heading,
  Input,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { Toaster, toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

const formSchema = z.object({
  email: z.string({ message: "Email required" }).email(),
  password: z.string({ message: "Password required" })
})

type FormValues = z.infer<typeof formSchema>

export default function AdminLogin() {
  const router = useRouter()

  const {
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
    register,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const result = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    const { token, message } = await result.json()

    if (!result.ok) {
      console.error({ result })
      toaster.create({
        description: `Error: ${message}`,
        type: "error",
        duration: 2000
      })
      return;
    }

    if (result.ok) {
      Cookies.set("at", token, { expires: 14, path: "/admin" })
      router.replace("/admin")
    }
  })

  return (
    <>
      <Head>
        <title>Admin Login | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>

      <Flex flexDir="column" h={{ base: "calc(100vh - 30vh)", md: "calc(100vh - 20vh)" }} justifyContent="center" alignItems="center">
        <Heading size="3xl" mb={10}>Login</Heading>
        <Container width={{ base: "85%", lg: "30%" }}>
          <form onSubmit={onSubmit}>
            <Field
              mb={10}
              invalid={!!errors.email}
              errorText={errors.email?.message}>
              <Group attached w="100%">
                <Input {...register("email")}
                  placeholder="Email" />
              </Group>
            </Field>
            <Field
              mb={10}
              invalid={!!errors.password}
              errorText={errors.password?.message}>
              <Group attached w="100%">
                <Input {...register("password")}
                  type="password"
                  placeholder="Password" />
              </Group>
            </Field>

            <Field>
              <Button
                w="100%"
                type="submit"
                loading={isLoading || isSubmitting}
                loadingText="Loading..."
              >Login</Button>
            </Field>
          </form>
          <Toaster />
        </Container>
      </Flex>
    </>
  )
}