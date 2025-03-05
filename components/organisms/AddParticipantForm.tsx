import { Button, createListCollection, Flex, Group, Input, SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { Field } from "@/components/ui/field";

interface IAddParticipantForm {
  goToList: () => void
}

const shirtSizes = createListCollection({
  items: [
    { label: "S (P: 67  L: 48)", value: "sm" },
    { label: "M (P: 69  L: 50)", value: "md" },
    { label: "L (P: 71  L: 52)", value: "L" },
    { label: "XL (P: 73  L: 54)", value: "xl" },
    { label: "2XL (P: 75 L: 56)", value: "2xl" },
    { label: "3XL (P: 75  L: 58)", value: "3xl" },
  ],
})

const formSchema = z.object({
  name: z.string({ message: "Nama jangan kosong dong" }).min(1),
  phone: z.string({ message: "Nomor telepon jangan kosong ya" }).min(1),
  email: z.string({ message: "Email jangan kosong  ya" }).email(),
  shirt_size: z.string({ message: "Ukuran baju wajib diisi" }).array(),
})

type FormValues = z.infer<typeof formSchema>

export default function AddParticipantForm({ goToList }: IAddParticipantForm) {

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
          <Input {...register("phone")}  placeholder="No. Telephone" />
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
                collection={shirtSizes}
                size="sm"
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Pilih ukuran baju" />
                </SelectTrigger>
                <SelectContent>
                  {shirtSizes.items.map((x) => (
                    <SelectItem item={x} key={x.value}>
                      {x.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            )}
          />

        </Field>

        <Field>
          <Group grow>
            <Button type="submit" >Save</Button>
            <Button variant="outline" onClick={goToList}>Cancel</Button>
          </Group>
        </Field>
      </form>

    </Flex>
  )
}