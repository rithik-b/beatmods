import { type InferSelectModel } from "drizzle-orm"
import { type gameVersionsTable } from "./drizzle"

type GameVersion = InferSelectModel<typeof gameVersionsTable>

export default GameVersion
