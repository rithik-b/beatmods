import { type InferSelectModel } from "drizzle-orm"
import { type gameVersionsTable } from "./dbSchema"

type GameVersion = InferSelectModel<typeof gameVersionsTable>

export default GameVersion
