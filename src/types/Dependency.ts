import { valid } from "semver"
import { z } from "zod"

export default z.object({
  id: z.string().min(1),
  version: z.string().refine((v) => valid(v) !== null),
})
