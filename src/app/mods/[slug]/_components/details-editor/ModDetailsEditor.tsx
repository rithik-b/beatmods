"use client"

import { Button } from "@beatmods/components/ui/button"
import { Input } from "@beatmods/components/ui/input"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, Form } from "@beatmods/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type z } from "zod"
import { useForm } from "react-hook-form"
import { api, dontRetryOn404 } from "@beatmods/trpc/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beatmods/components/ui/select"
import { Suspense, useState } from "react"
import { Loader2, Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@beatmods/components/ui/dialog"
import EditModDetailsSchema from "@beatmods/types/EditModDetailsSchema"
import useModDetails from "../../_hooks/useModDetails"
import { getTRPCErrorFromUnknown } from "@trpc/server"

interface FormProps {
  onSuccess: () => Promise<void>
  onError: (error: string | undefined) => void
}

function ModDetailsEditForm({ onSuccess, onError }: FormProps) {
  const mod = useModDetails()!
  const [categories] = api.categories.useSuspenseQuery()
  const [pendingMod] = api.mods.getPendingModDetails.useSuspenseQuery(
    {
      modId: mod.id,
    },
    {
      useErrorBoundary: false,
      retry: dontRetryOn404,
    },
  )
  const form = useForm<z.infer<typeof EditModDetailsSchema>>({
    resolver: zodResolver(EditModDetailsSchema),
    defaultValues: {
      modId: mod.id,
      description: pendingMod?.description ?? mod.description ?? "",
      moreInfoUrl: pendingMod?.moreInfoUrl ?? mod.moreInfoUrl,
      category: pendingMod?.category ?? mod.category,
    },
  })
  const { mutateAsync: updateModDetails } = api.mods.editModDetails.useMutation()

  const onSubmit = async (formData: z.infer<typeof EditModDetailsSchema>) => {
    onError(undefined)
    try {
      await updateModDetails(formData)
      await onSuccess()
    } catch (e) {
      onError(getTRPCErrorFromUnknown(e).message)
    }
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="optional" {...field} value={field.value ?? ""} autoComplete="off" />
              </FormControl>
              <FormDescription>Short description that will be shown on mod installers</FormDescription>
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
              <FormDescription>E.g. link to the mod&apos;s repo</FormDescription>
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
        <Button type="submit" isLoading={form.formState.isSubmitting} className="w-full">
          Submit Changes
        </Button>
      </form>
    </Form>
  )
}

export default function ModDetailsEditor() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const mod = useModDetails()!
  const utils = api.useUtils()

  const onSuccess = async () => {
    setIsOpen(false)
    await utils.mods.getPendingModDetails.invalidate({ modId: mod.id })
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
          <Pencil size={14} /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {mod.name}</DialogTitle>
          <DialogDescription className="text-destructive">{!!error && error}</DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <ModDetailsEditForm onError={setError} onSuccess={onSuccess} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
