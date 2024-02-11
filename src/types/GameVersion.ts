import { type InferSelectModel } from "drizzle-orm"
import type dbSchema from "./dbSchema"

type GameVersion = InferSelectModel<typeof dbSchema.gameVersions>

export default GameVersion
