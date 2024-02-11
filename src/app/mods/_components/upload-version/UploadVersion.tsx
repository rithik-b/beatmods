"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { type z } from "zod"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage,
} from "@beatmods/components/ui/form"
import { Input } from "@beatmods/components/ui/input"
import { useMemo, useState } from "react"
import { Button } from "@beatmods/components/ui/button"
import { api } from "@beatmods/trpc/react"
import ModDropzone from "./ModDropzone"
import { getSupabaseBrowserClient } from "@beatmods/utils"
import GameVersionInput from "./GameVersionInput"
import DependenciesEditor from "./DependenciesEditor"
import NewVersionSchema from "@beatmods/types/NewVersionSchema"
import { getTRPCErrorFromUnknown } from "@trpc/server"

interface Props {
  modId: string
  onUploadSuccess: (
    modVersion: z.infer<typeof NewVersionSchema>,
  ) => Promise<void>
  onError: (error: string | undefined) => void
}

export default function UploadVersion({
  modId,
  onUploadSuccess,
  onError,
}: Props) {
  const form = useForm<z.infer<typeof NewVersionSchema>>({
    resolver: zodResolver(NewVersionSchema),
    defaultValues: {
      modId,
      version: "",
      supportedGameVersionIds: [],
      dependencies: [],
    },
  })
  const [allGameVersions] = api.gameVersions.useSuspenseQuery()
  const [selectedGameVersionIds, setSelectedGameVersionIds] = useState<
    string[]
  >([])
  const [modFile, setModFile] = useState<File | undefined>(undefined)
  const { mutateAsync: getUploadUrlAsync } =
    api.mods.versions.getUploadUrl.useMutation()

  const onSubmit = async (formData: z.infer<typeof NewVersionSchema>) => {
    if (!modFile) return
    onError(undefined)

    try {
      const uploadUrl = await getUploadUrlAsync(formData)
      const supabase = getSupabaseBrowserClient()
      const response = await supabase.storage
        .from("mods")
        .uploadToSignedUrl(uploadUrl.data!.path, uploadUrl.data!.token, modFile)

      if (response.error) {
        onError(
          (response.error as { message: string } | undefined)?.message ??
            "Mod upload failed",
        )
        return
      }

      await onUploadSuccess(formData)
    } catch (e) {
      onError(getTRPCErrorFromUnknown(e).message)
    }
  }

  const hasErrors = useMemo(
    () => Object.keys(form.formState.errors).length > 0,
    [form.formState],
  )

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version*</FormLabel>
              <FormControl>
                <Input placeholder="1.0.0" {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supportedGameVersionIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supported Game Versions*</FormLabel>
              <FormControl>
                <GameVersionInput
                  value={field.value}
                  onChange={(newGameVersionIds) => {
                    field.onChange(newGameVersionIds)
                    setSelectedGameVersionIds(newGameVersionIds)
                  }}
                  allGameVersions={allGameVersions}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dependencies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dependencies</FormLabel>
              <FormControl>
                <DependenciesEditor
                  gameVersionIds={selectedGameVersionIds}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ModDropzone setFile={setModFile} />
        <Button
          type="submit"
          disabled={!modFile || hasErrors}
          isLoading={form.formState.isSubmitting}
        >
          Upload
        </Button>
      </form>
    </Form>
  )
}
