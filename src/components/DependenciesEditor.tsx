import { api } from "@beatmods/trpc/react"
import Editor, { useMonaco } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface Props {
  gameVersionIds: string[]
}

function getSchemaPropertiesFromModVersions(
  modVersions: Map<string, string[]>,
) {
  const properties: Record<string, { type: string; enum: string[] }> = {}
  for (const modVersion of modVersions) {
    properties[modVersion[0]] = {
      type: "string",
      enum: modVersion[1].map((version) => `^${version}`),
    }
  }
  return properties
}

export default function DependenciesEditor({
  gameVersionIds: gameVersions,
}: Props) {
  const { data } = api.mods.getModsForGameVersions.useQuery(gameVersions, {
    enabled: gameVersions.length > 0,
    refetchOnMount: false,
  })

  const monaco = useMonaco()
  const { resolvedTheme } = useTheme()
  const [hasSetTheme, setHasSetTheme] = useState(false)

  useEffect(() => {
    if (!monaco || (!data && gameVersions.length > 0)) return

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

  return (
    <div className="h-[200px] w-full rounded-md border py-2 pr-1">
      {hasSetTheme && (
        <Editor
          defaultLanguage="json"
          defaultValue={"{\n    \n}"}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          onValidate={(markers) => console.log(markers)}
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
