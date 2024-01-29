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
import type GameVersion from "@beatmods/types/GameVersion"
import { useMemo, useState } from "react"
import { Button } from "@beatmods/components/ui/button"
import { api } from "@beatmods/trpc/react"
import ModDropzone from "./ModDropzone"
import { getSupabaseBrowserClient } from "@beatmods/utils"
import GameVersionInput from "./GameVersionInput"
import DependenciesEditor from "./DependenciesEditor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@beatmods/components/ui/dialog"
import { Plus } from "lucide-react"
import NewVersionSchema from "@beatmods/types/NewVersionSchema"

interface UploadVersionContentProps {
  modId: string
  gameVersions: GameVersion[]
  onUploadSuccess?: () => void
  onCloseAutoFocus?: () => void
}

function UploadVersionContent({
  modId,
  gameVersions: allGameVersions,
  onUploadSuccess,
  onCloseAutoFocus,
}: UploadVersionContentProps) {
  const form = useForm<z.infer<typeof NewVersionSchema>>({
    resolver: zodResolver(NewVersionSchema),
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

  const onSubmit = async (formData: z.infer<typeof NewVersionSchema>) => {
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

    onUploadSuccess?.()
  }

  const hasErrors = useMemo(
    () => Object.keys(form.formState.errors).length > 0,
    [form.formState.errors],
  )

  return (
    <DialogContent onCloseAutoFocus={onCloseAutoFocus}>
      <DialogHeader>
        <DialogTitle>New Version</DialogTitle>
        <DialogDescription>Upload a new version of your mod</DialogDescription>
      </DialogHeader>
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
    </DialogContent>
  )
}

interface UploadVersionProps {
  modId: string
  gameVersions: GameVersion[]
}

export default function UploadVersion({
  modId,
  gameVersions,
}: UploadVersionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) setModalVisible(true)
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex flex-row items-center gap-2">
          <Plus /> Add new version
        </Button>
      </DialogTrigger>
      {modalVisible && ( // Need to do this to reset the form when the modal is closed
        <UploadVersionContent
          modId={modId}
          gameVersions={gameVersions}
          onUploadSuccess={() => {
            setIsOpen(false)
          }}
          onCloseAutoFocus={() => {
            setModalVisible(false)
          }}
        />
      )}
    </Dialog>
  )
}
