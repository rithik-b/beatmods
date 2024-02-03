"server only"

import { env } from "@beatmods/env"
import { type Database } from "@beatmods/types/autogen/supabase"
import { createClient } from "@supabase/supabase-js"

export default createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
)
