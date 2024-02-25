import { api } from "@beatmods/trpc/react"
import Editor, { type OnValidate, useMonaco } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useState } from "react"
import { type editor } from "monaco-editor"
import { cn } from "@beatmods/utils"
import { type z } from "zod"
import type Dependency from "@beatmods/types/Dependency"

interface Props {
  gameVersionIds: string[]
  hasError?: boolean
  value?: z.infer<typeof Dependency>[]
  onChange?: (value: z.infer<typeof Dependency>[]) => void
  onValidate?: OnValidate
  onFocus?: () => void
  onBlur?: () => void
}

function getSchemaPropertiesFromModVersions(modVersions: Map<string, string[]>) {
  const properties: Record<string, { type: string; enum: string[] }> = {}
  for (const modVersion of modVersions) {
    properties[modVersion[0]] = {
      type: "string",
      enum: modVersion[1].map((version) => `^${version}`),
    }
  }
  return properties
}

function convertDependenciesToEditorValue(dependencies: z.infer<typeof Dependency>[]) {
  if (dependencies.length === 0) return "{\n    \n}"

  const dependenciesObject: Record<string, string> = {}
  for (const dependency of dependencies) {
    dependenciesObject[dependency.id] = dependency.version
  }
  return JSON.stringify(dependenciesObject, null, 4)
}

function convertEditorValueToDependencies(editorValue: string) {
  const dependenciesObject = JSON.parse(editorValue) as Record<string, string>
  const dependencies: z.infer<typeof Dependency>[] = []
  for (const dependency of Object.entries(dependenciesObject)) {
    dependencies.push({ id: dependency[0], version: dependency[1] })
  }
  return dependencies
}

export default function DependenciesEditor({
  gameVersionIds,
  hasError,
  value,
  onChange,
  onValidate,
  onFocus,
  onBlur,
}: Props) {
  const { data } = api.mods.versions.getModsForGameVersions.useQuery(gameVersionIds, {
    enabled: gameVersionIds.length > 0,
    refetchOnMount: false,
  })

  const monaco = useMonaco()
  const { resolvedTheme } = useTheme()
  const [hasSetTheme, setHasSetTheme] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [editorValue, setEditorValue] = useState<string | undefined>("")

  useEffect(() => {
    if (!monaco || (!data && gameVersionIds.length > 0)) return

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: "inmemory://model/main.json",
          fileMatch: ["*"],
          schema: {
            type: "object",
            properties: !!data ? getSchemaPropertiesFromModVersions(data) : {},
            additionalProperties: false,
          },
        },
      ],
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, monaco])

  useEffect(() => {
    if (!monaco) return
    monaco.editor.defineTheme("dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#030712",
      },
    })
    setHasSetTheme(true)
  }, [monaco])

  const onEditorMount = useCallback(
    (editor: editor.IStandaloneCodeEditor) => {
      editor.onDidFocusEditorText(() => {
        setIsFocused(true)
        if (!!onFocus) onFocus()
      })

      editor.onDidBlurEditorText(() => {
        setIsFocused(false)
        if (!!onBlur) onBlur()
      })
    },
    [onBlur, onFocus],
  )

  // Only update the editor value if the value prop changes when unfocused
  useEffect(() => {
    if (!value || isFocused) return
    setEditorValue(convertDependenciesToEditorValue(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const onValidateInternal: OnValidate = useCallback(
    (markers) => {
      if (!!onValidate) onValidate(markers)

      if (markers.length === 0 && !!onChange && !!editorValue) onChange(convertEditorValueToDependencies(editorValue))
    },
    [editorValue, onChange, onValidate],
  )

  return (
    <div
      className={cn(
        "h-[200px] w-full rounded-md border py-2 pr-1 ring-offset-background",
        isFocused ? "ring-2 ring-ring ring-offset-2" : "",
        hasError ? "border-destructive ring-destructive" : "",
      )}
    >
      {hasSetTheme && (
        <Editor
          defaultLanguage="json"
          defaultValue={"{\n    \n}"}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          onValidate={onValidateInternal}
          onMount={onEditorMount}
          value={editorValue}
          onChange={setEditorValue}
          options={{
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            glyphMargin: false,
            folding: false,
            contextmenu: false,
            scrollbar: { vertical: "auto" },
            fontSize: 14,
            overviewRulerLanes: 0,
          }}
        />
      )}
    </div>
  )
}
