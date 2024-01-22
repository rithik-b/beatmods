"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@beatmods/components/ui/card"
import { NewVersionSchemaWithoutUploadPath } from "@beatmods/types/NewVersionSchema"
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
import type GameVersion from "@beatmods/types/GameVersion"
import { useMemo, useState } from "react"
import { Button } from "@beatmods/components/ui/button"
import { api } from "@beatmods/trpc/react"
import ModDropzone from "./ModDropzone"
import { getSupabaseBrowserClient } from "@beatmods/utils"
import GameVersionInput from "./GameVersionInput"
import DependenciesEditor from "./DependenciesEditor"

interface Props {
  modId: string
  gameVersions: GameVersion[]
}

export default function UploadVersion({
  modId,
  gameVersions: allGameVersions,
}: Props) {
  const form = useForm<z.infer<typeof NewVersionSchemaWithoutUploadPath>>({
    resolver: zodResolver(NewVersionSchemaWithoutUploadPath),
    defaultValues: {
      modId,
      version: "",
      supportedGameVersionIds: [],
      dependencies: [],
    },
  })
  const [selectedGameVersionIds, setSelectedGameVersionIds] = useState<
    string[]
  >([])
  const [modFile, setModFile] = useState<File | undefined>(undefined)
  const { mutateAsync: getUploadUrlAsync } =
    api.mods.getUploadUrlForNewModVersion.useMutation()
  const { mutateAsync: createNewModVersionAsync } =
    api.mods.createNewModVersion.useMutation()

  const onSubmit = async (
    formData: z.infer<typeof NewVersionSchemaWithoutUploadPath>,
  ) => {
    if (!modFile) return

    const uploadUrl = await getUploadUrlAsync(formData)
    const supabase = getSupabaseBrowserClient()

    const { data } = await supabase.storage
      .from("mods")
      .uploadToSignedUrl(uploadUrl.data!.path, uploadUrl.data!.token, modFile)

    await createNewModVersionAsync({
      ...formData,
      uploadPath: data!.path,
    })
  }
  const hasErrors = useMemo(
    () => Object.keys(form.formState.errors).length > 0,
    [form.formState.errors],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Version</CardTitle>
        <CardDescription>Upload a new version of your mod</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
