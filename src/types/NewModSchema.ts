import { z } from "zod"

// TODO verify accepted patterns with BSIPA
export default z.object({
  id: z.string().min(1),
  name: z.ostring(),
  description: z.ostring(),
  moreInfoUrl: z.string().url(),
  category: z.string().min(1),
})
