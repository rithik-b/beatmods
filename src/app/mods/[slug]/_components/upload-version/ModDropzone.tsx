import { cn } from "@beatmods/utils"
import { FileWarning, FolderArchive, FolderUp } from "lucide-react"
import { useCallback, useEffect } from "react"
import { type FileRejection, useDropzone } from "react-dropzone"

interface Props {
  setFile: (file: File | undefined) => void
}

export default function ModDropzone({ setFile }: Props) {
  const validate = useCallback((file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      return {
        code: "file-too-large",
        message: "File is too large",
      }
    }
    return null
  }, [])

  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    maxFiles: 1,
    multiple: false,
    accept: {
      "application/zip": [],
    },
    validator: validate,
  })

  useEffect(() => {
    setFile(acceptedFiles?.[0])
  }, [acceptedFiles, setFile])

  return (
    <div className="flex flex-col gap-2">
      <span className="h-4 text-sm font-medium text-destructive transition-all">
        {fileRejections.length > 0 && fileRejections[0]!.errors[0]!.message}
      </span>

      <div
        className={cn(
          "flex cursor-pointer justify-center rounded-md border p-5 transition-all hover:border-foreground hover:font-medium",
          fileRejections.length > 0 &&
            "border-destructive hover:border-red-600 hover:dark:border-red-500",
        )}
        {...getRootProps()}
      >
        <div className="flex gap-2">
          <DropzoneContents
            {...{ acceptedFiles, fileRejections, isDragActive }}
          />
        </div>
        <input {...getInputProps()} />
      </div>
    </div>
  )
}

interface DropzoneContentsProps {
  acceptedFiles: File[]
  fileRejections: FileRejection[]
  isDragActive: boolean
}
function DropzoneContents(props: DropzoneContentsProps) {
  const { acceptedFiles, fileRejections, isDragActive } = props

  if (acceptedFiles.length > 0)
    return (
      <>
        <FolderArchive />
        <span>{acceptedFiles[0]!.name}</span>
      </>
    )

  if (fileRejections.length > 0)
    return (
      <>
        <FileWarning className="text-destructive" />
        <span className="text-destructive">{fileRejections[0]!.file.name}</span>
      </>
    )

  return (
    <>
      <FolderUp />
      <span>
        {isDragActive
          ? "Drop here"
          : "Drag and drop your mod here, or click to upload"}
      </span>
    </>
  )
}
