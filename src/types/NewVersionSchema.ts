import { valid } from "semver"
import { z } from "zod"
import Dependency from "./Dependency"

export default z.object({
  modId: z.string(),
  version: z
    .string()
    .min(1, { message: "Version is required" })
    .refine((v) => valid(v) !== null, { message: "Version is not valid" }),
  supportedGameVersionIds: z
    .array(z.string().uuid({ message: "Supported Game Version ids are not valid" }))
    .nonempty({ message: "Supported Game Versions are required" }),
  dependencies: z.array(Dependency),
})
