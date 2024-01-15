"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@beatmods/components/ui/card"
import newVersionSchema from "@beatmods/types/newVersionSchema"
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

interface Props {
  modId: string
  gameVersions: GameVersion[]
}

export default function UploadVersion({ modId, gameVersions }: Props) {
  const form = useForm<z.infer<typeof newVersionSchema>>({
    resolver: zodResolver(newVersionSchema),
    defaultValues: {
      version: "",
      gameVersions: [],
      dependencies: [],
    },
  })
  const [gameVersionInputValue, setGameVersionInputValue] = useState("")

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
                      {...field}
                      placeholder="Game Versions"
                      inputValue={gameVersionInputValue}
                      setInputValue={setGameVersionInputValue}
                    >
                      {gameVersions
                        .filter((v) => !field.value.includes(v.version))
                        .map((gameVersion) => (
                          <CommandItem
                            key={gameVersion.id}
                            value={gameVersion.version}
                            onSelect={(currentValue) => {
                              field.onChange([...field.value, currentValue])
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
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
