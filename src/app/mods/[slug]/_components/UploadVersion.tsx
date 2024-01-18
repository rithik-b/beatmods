"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@beatmods/components/ui/card"
import NewVersionSchema from "@beatmods/types/NewVersionSchema"
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
import TagInput from "@beatmods/components/ui/tag-input"
import { CommandItem } from "@beatmods/components/ui/command"
import { useState } from "react"
import DependenciesEditor from "@beatmods/components/DependenciesEditor"

interface Props {
  modId: string
  gameVersions: GameVersion[]
}

export default function UploadVersion({ modId, gameVersions }: Props) {
  const form = useForm<z.infer<typeof NewVersionSchema>>({
    resolver: zodResolver(NewVersionSchema),
    defaultValues: {
      version: "",
      gameVersions: [],
      dependencies: [],
    },
  })
  const [gameVersionInputValue, setGameVersionInputValue] = useState("")
  const [selectedGameVersionIds, setSelectedGameVersionIds] = useState<
    string[]
  >([])

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Version</CardTitle>
        <CardDescription>Upload a new version of your mod</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version*</FormLabel>
                  <FormControl>
                    <Input placeholder="1.0.0" {...field} />
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
                    <TagInput
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value)
                        setSelectedGameVersionIds(value)
                      }}
                      placeholder="Game Versions"
                      inputValue={gameVersionInputValue}
                      setInputValue={setGameVersionInputValue}
                      getLabel={(gameVersionId) =>
                        gameVersions.find((v) => v.id === gameVersionId)!
                          .version
                      }
                    >
                      {gameVersions
                        .filter((v) => !field.value.includes(v.id))
                        .map((gameVersion) => (
                          <CommandItem
                            key={gameVersion.id}
                            value={gameVersion.version}
                            onSelect={() => {
                              const newGameVersions = [
                                ...field.value,
                                gameVersion.id,
                              ]
                              field.onChange(newGameVersions)
                              setSelectedGameVersionIds(newGameVersions)
                              setGameVersionInputValue("")
                            }}
                          >
                            {gameVersion.version}
                          </CommandItem>
                        ))}
                    </TagInput>
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
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
