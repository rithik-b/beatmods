"use client"

import { Button } from "@beatmods/components/ui/button"
import { Input } from "@beatmods/components/ui/input"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  Form,
} from "@beatmods/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type z } from "zod"
import { useForm } from "react-hook-form"
import { api } from "@beatmods/trpc/react"
import newModSchema from "@beatmods/types/NewModSchema"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@beatmods/components/ui/select"
import { useRouter } from "next/navigation"

interface Props {
  categories: string[]
}

export default function NewModForm({ categories }: Props) {
  const form = useForm<z.infer<typeof newModSchema>>({
    resolver: zodResolver(newModSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      moreInfoUrl: "",
      category: categories[0],
    },
  })
  const router = useRouter()
  const { mutateAsync } = api.mods.createNew.useMutation()

  const onSubmit = async (values: z.infer<typeof newModSchema>) => {
    const result = await mutateAsync(values)
    router.push(`/mods/${result}`)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 rounded-xl border-2 border-border bg-card p-5 text-card-foreground"
      >
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID*</FormLabel>
              <FormControl>
                <Input placeholder="SongCore" {...field} autoComplete="off" />
              </FormControl>
              <FormDescription>This is the BSIPA Mod ID</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input placeholder="SongCore" {...field} autoComplete="off" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="optional" {...field} autoComplete="off" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="moreInfoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>More Info Link*</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormDescription>
                E.g. link to the mod&apos;s repo
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} {...field}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          Create
        </Button>
      </form>
    </Form>
  )
}
