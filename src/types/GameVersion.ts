import { type Database } from "@beatmods/types/autogen/supabase"

type GameVersion = Database["public"]["Tables"]["game_versions"]["Row"]

export default GameVersion
