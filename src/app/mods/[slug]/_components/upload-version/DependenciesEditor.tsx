import DependenciesEditorBase from "@beatmods/components/DependenciesEditor"
import { useFormField } from "@beatmods/components/ui/form"
import { type NewVersionSchemaWithoutUploadPath } from "@beatmods/types/NewVersionSchema"
import { type OnValidate } from "@monaco-editor/react"
import { type ComponentProps, useCallback, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { type z } from "zod"

type Props = Omit<
  ComponentProps<typeof DependenciesEditorBase>,
  "hasError" | "onFocus" | "onBlur" | "onValidate"
>

export default function DependenciesEditor(props: Props) {
  const { error } = useFormField()
  const { setError, clearErrors } =
    useFormContext<z.infer<typeof NewVersionSchemaWithoutUploadPath>>()
  const errorRef = useRef<string | undefined>(undefined)
  const isFocusedRef = useRef(false)

  const onValidate: OnValidate = useCallback(
    (markers) => {
      if (markers.length === 0) {
        clearErrors("dependencies")
        errorRef.current = undefined
        return
      }

      errorRef.current = markers[0]!.message
      // Only set the error on the form when the editor is not focused
      if (!isFocusedRef.current)
        setError("dependencies", { message: errorRef.current })
    },
    [clearErrors, setError],
  )

  // Only set the error on the form when the editor loses focus
  const onBlur = useCallback(() => {
    if (errorRef.current) {
      setError("dependencies", { message: errorRef.current })
    }
    isFocusedRef.current = false
  }, [setError])

  const onFocus = useCallback(() => {
    isFocusedRef.current = true
  }, [])

  return (
    <DependenciesEditorBase
      {...props}
      hasError={!!error}
      onValidate={onValidate}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}
