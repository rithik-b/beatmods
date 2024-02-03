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
import NewModSchema from "@beatmods/types/NewModSchema"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@beatmods/components/ui/select"
import { Suspense, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@beatmods/components/ui/dialog"
import { getTRPCErrorFromUnknown } from "@trpc/server"
import UploadVersion from "./upload-version/UploadVersion"
import type NewVersionSchema from "@beatmods/types/NewVersionSchema"
import { useRouter } from "next/navigation"

interface NewModFormProps {
  onError: (error: string | undefined) => void
  onSuccess: (modDetails: z.infer<typeof NewModSchema>) => void
}

function NewModForm({ onError, onSuccess }: NewModFormProps) {
  const [categories] = api.categories.useSuspenseQuery()
  const form = useForm<z.infer<typeof NewModSchema>>({
    resolver: zodResolver(NewModSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      moreInfoUrl: "",
      category: categories[0],
    },
  })
  const { mutateAsync } = api.mods.validateNew.useMutation()

  const onSubmit = async (values: z.infer<typeof NewModSchema>) => {
    onError(undefined)
    try {
      await mutateAsync(values)
      onSuccess(values)
    } catch (e) {
      onError(getTRPCErrorFromUnknown(e).message)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID*</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="optional" {...field} autoComplete="off" />
              </FormControl>
              <FormDescription>Same as Mod ID if not specified</FormDescription>
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
              <FormDescription>
                Short description that will be shown on mod installers
              </FormDescription>
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
          Next
        </Button>
      </form>
    </Form>
  )
}

export default function NewMod() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [modDetails, setModDetails] = useState<
    z.infer<typeof NewModSchema> | undefined
  >(undefined)
  const { mutateAsync } = api.mods.createNew.useMutation()
  const router = useRouter()

  const onUploadSuccess = async (
    modVersion: z.infer<typeof NewVersionSchema>,
  ) => {
    try {
      const response = await mutateAsync({
        mod: modDetails!,
        version: modVersion,
      })
      setIsOpen(false)
      router.push(`/mods/${response}`)
    } catch (e) {
      setError(getTRPCErrorFromUnknown(e).message)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex flex-row items-center gap-2">
          <Plus /> Create new mod
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Mod</DialogTitle>
          <DialogDescription>Create a new mod</DialogDescription>
          <DialogDescription className="text-destructive">
            {!!error && error}
          </DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          {!modDetails ? (
            <NewModForm onError={setError} onSuccess={setModDetails} />
          ) : (
            <UploadVersion
              modId={modDetails.id}
              onUploadSuccess={onUploadSuccess}
              onError={setError}
            />
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
