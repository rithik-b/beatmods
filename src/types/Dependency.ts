import { valid } from "semver"
import { z } from "zod"

export default z.object({
  id: z.string().min(1),
  version: z
    .string()
    .refine((v) => v.startsWith("^"), {
      message: "Only caret ranges are supported",
    })
    .refine((v) => valid(v.slice(1)) !== null, {
      message: "Not a valid semver version",
    }),
})
