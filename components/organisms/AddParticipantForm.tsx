import {
  Button,
  Flex,
  Group,
  Input,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { Field } from "@/components/ui/field";
import { Toaster, toaster } from "@/components/ui/toaster";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { formatToE164, SHIRT_SIZES } from "@/utils/helper";

interface IAddParticipantForm {
  goToList: () => void
}

const formSchema = z.object({
  name: z.string({ message: "Nama jangan kosong dong" }).min(1),
  phone: z.string({ message: "Nomor telepon jangan kosong ya" }).min(1),
  email: z.string({ message: "Email jangan kosong ya" }).email(),
  shirt_size: z.string({ message: "Ukuran baju wajib diisi" }).array(),
})

export type NewParticipantFormValues = z.infer<typeof formSchema>

export default function AddParticipantForm({ goToList }: IAddParticipantForm) {

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
    control,
    register,
    reset,
  } = useForm<NewParticipantFormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = handleSubmit(async (data) => {

    const token = Cookies.get("at");
    const response = await fetch("/api/admin/participant/", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        participant: {
          ...data,
          phone: formatToE164(data.phone),
          shirt_size: data.shirt_size[0].toUpperCase(),
        }
      })
    });

    const { message } = await response.json()

    if (!response.ok) {
      toaster.create({
        description: message,
        type: "error"
      })
      return;
    }

    goToList()
  })

  useEffect(() => {
    reset()
  }, [reset])

  return (
    <Flex justifyContent="center">
      <form onSubmit={onSubmit}>
        <Field mb={5} label="Name"
          invalid={!!errors.name}
          errorText={errors.name?.message}>
          <Input {...register("name")} placeholder="Nama Lengkap" />
        </Field>
        <Field mb={5} label="Phone"
          invalid={!!errors.phone}
          errorText={errors.phone?.message}>
          <Group attached w="100%">
            <Input {...register("phone")}
              borderRadius="md"
              inputMode="numeric"
              placeholder="No. Telephone" />
          </Group>
        </Field>
        <Field mb={5} label="Email"
          invalid={!!errors.phone}
          errorText={errors.phone?.message}>
          <Input {...register("email")} placeholder="Email" />
        </Field>
        <Field mb={5} label="Shirt size" width="320px"
          invalid={!!errors.shirt_size}
          errorText={errors.shirt_size?.message}>
          <Controller
            control={control}
            name="shirt_size"
            render={({ field }) => (
              <SelectRoot
                name={field.name}
                value={field.value}
                onValueChange={({ value }) => field.onChange(value)}
                onInteractOutside={() => field.onBlur()}
                collection={SHIRT_SIZES}
                size="sm"
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Pilih ukuran baju" />
                </SelectTrigger>
                <SelectContent>
                  {SHIRT_SIZES.items.map((x) => (
                    <SelectItem item={x} key={x.value}>
                      {x.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            )}
          />

        </Field>

        <Field alignItems="end">
          <Group grow>
            <Button type="submit" loading={isSubmitting || isLoading}>Save</Button>
            <Button variant="outline" loading={isSubmitting || isLoading} onClick={goToList}>Cancel</Button>
          </Group>
        </Field>
      </form>

      <Toaster />
    </Flex>
  )
}