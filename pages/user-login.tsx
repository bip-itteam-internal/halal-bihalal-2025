import { Field } from "@/components/ui/field";
import { Button, Container, Flex, Heading, Input } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod"

const formSchema = z.object({
  phone: z.string({ message: "Nomor telepon jangan kosong ya" }).min(1),
})

type FormValues = z.infer<typeof formSchema>

export default function UserLogin() {

  const {
    handleSubmit,
    formState: { errors },
    control,
    register
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = handleSubmit((data) => console.log(data))

  return (
    <>
      <Head>
        <title>Login | Halal Bihalal 2025</title>
        <meta name="description" content="Letto show @bharatainternationalpharmaceutical" />
      </Head>

      <Flex flexDir="column" h="calc(100vh - 20vh)" justifyContent="center" alignItems="center">
        <Heading size="3xl" mb={10}>Login</Heading>
        <Container width="30%">
          <form onSubmit={onSubmit}>
            <Field
              mb={5}
              invalid={!!errors.phone}
              errorText={errors.phone?.message}>
              <Input {...register("phone")} placeholder="No. Telephone" />
            </Field>
            <Field>
              <Button w="100%" type="submit">Login</Button>
            </Field>
          </form>
        </Container>
      </Flex>
    </>
  )
}