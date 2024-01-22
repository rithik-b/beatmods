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
} from "@beatmods/components/ui/form"
import { Input } from "@beatmods/components/ui/input"
import type GameVersion from "@beatmods/types/GameVersion"
import { useState } from "react"
import DependenciesEditor from "@beatmods/components/DependenciesEditor"
import { Button } from "@beatmods/components/ui/button"
import { api } from "@beatmods/trpc/react"
import ModDropzone from "./ModDropzone"
import { getSupabaseBrowserClient } from "@beatmods/utils"
import GameVersionInput from "./GameVersionInput"

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
      gameVersions: [],
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
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gameVersions"
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
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <ModDropzone setFile={setModFile} />
            <Button type="submit" disabled={!modFile}>
              Upload
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
