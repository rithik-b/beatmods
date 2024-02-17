import { z } from "zod"

export default z.object({
  modId: z.string(),
  description: z.string().nullable(),
  moreInfoUrl: z.string().url(),
  category: z.string().min(1),
})
