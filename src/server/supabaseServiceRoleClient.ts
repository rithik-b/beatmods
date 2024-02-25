"server only"

import { env } from "@beatmods/env"
import { createClient } from "@supabase/supabase-js"

export default createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
