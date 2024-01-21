import { valid } from "semver"
import { z } from "zod"
import Dependency from "./Dependency"

export const NewVersionSchemaWithoutUploadUrl = z.object({
  modId: z.string(),
  version: z.string().refine((v) => valid(v) !== null),
  gameVersions: z.array(z.string().uuid()).nonempty(),
  dependencies: z.array(Dependency),
})

export default z.object({
  ...NewVersionSchemaWithoutUploadUrl.shape,
  uploadUrl: z.string().url(),
})
