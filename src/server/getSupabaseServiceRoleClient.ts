"server only"

import { env } from "@beatmods/env"
import { type Database } from "@beatmods/types/supabase"
import { createClient } from "@supabase/supabase-js"

export default function getSupabaseServiceRoleClient() {
    return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ADMIN_KEY)
}