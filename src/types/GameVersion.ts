import { type Database } from "@beatmods/types/supabase"

type GameVersion = Database["public"]["Tables"]["game_versions"]["Row"]

export default GameVersion
