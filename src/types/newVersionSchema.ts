import { valid } from "semver"
import { z } from "zod"
import Dependency from "./Dependency"

export const NewVersionSchemaWithoutUploadPath = z.object({
  modId: z.string(),
  version: z.string().refine((v) => valid(v) !== null),
  gameVersions: z.array(z.string().uuid()).nonempty(),
  dependencies: z.array(Dependency),
})

export default z.object({
  ...NewVersionSchemaWithoutUploadPath.shape,
  uploadPath: z.string(),
})
