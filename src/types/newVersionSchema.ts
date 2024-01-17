import { valid } from "semver"
import { z } from "zod"
import Dependency from "./Dependency"

export default z.object({
  version: z.string().refine((v) => valid(v) !== null),
  gameVersions: z.array(z.string().uuid()).nonempty(),
  dependencies: z.array(Dependency),
})
