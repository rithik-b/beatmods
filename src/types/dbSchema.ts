import { relations } from "drizzle-orm"
import {
  pgTable,
  unique,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  pgSchema,
} from "drizzle-orm/pg-core"

const keyStatus = pgEnum("key_status", [
  "default",
  "valid",
  "invalid",
  "expired",
])
const keyType = pgEnum("key_type", [
  "aead-ietf",
  "aead-det",
  "hmacsha512",
  "hmacsha256",
  "auth",
  "shorthash",
  "generichash",
  "kdf",
  "secretbox",
  "secretstream",
  "stream_xchacha20",
])
const requestStatus = pgEnum("request_status", ["PENDING", "SUCCESS", "ERROR"])
const factorType = pgEnum("factor_type", ["totp", "webauthn"])
const factorStatus = pgEnum("factor_status", ["unverified", "verified"])
const aalLevel = pgEnum("aal_level", ["aal1", "aal2", "aal3"])
const codeChallengeMethod = pgEnum("code_challenge_method", ["s256", "plain"])

const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (table) => {
    return {
      categoriesNameKey: unique("Categories_name_key").on(table.name),
    }
  },
)

const gameVersions = pgTable(
  "game_versions",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    version: text("version").notNull(),
    published: boolean("published").default(false).notNull(),
  },
  (table) => {
    return {
      gameVersionsVersionKey: unique("GameVersions_version_key").on(
        table.version,
      ),
    }
  },
)

const gameVersionsRelations = relations(gameVersions, ({ many }) => ({
  mods: many(modVersionSupportedGameVersions, { relationName: "gameVersion" }),
}))

const users = pgSchema("auth").table("users", {
  id: uuid("id").primaryKey().notNull(),
})

const githubUsers = pgTable("github_users", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  authId: uuid("auth_id").references(() => users.id, {
    // Seperate and optional for seeding mock data
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  name: text("name"),
  userName: text("user_name").notNull(),
  avatarUrl: text("avatar_url"),
})

const githubUsersRelations = relations(githubUsers, ({ many }) => ({
  mods: many(modContributors, { relationName: "user" }),
}))

const modContributors = pgTable("mod_contributors", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  modId: text("mod_id")
    .notNull()
    .references(() => mods.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  userId: uuid("user_id")
    .notNull()
    .references(() => githubUsers.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
})

const modContributorsRelations = relations(modContributors, ({ one }) => ({
  user: one(githubUsers, {
    fields: [modContributors.userId],
    references: [githubUsers.id],
    relationName: "user",
  }),
  mod: one(mods, {
    fields: [modContributors.modId],
    references: [mods.id],
    relationName: "mod",
  }),
}))

const modVersionDependencies = pgTable("mod_version_dependencies", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  modVersionsId: uuid("mod_versions_id")
    .notNull()
    .references(() => modVersions.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  semver: text("semver").notNull(),
  dependencyId: text("dependency_id")
    .notNull()
    .references(() => mods.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
})

const modVersionDependenciesRelations = relations(
  modVersionDependencies,
  ({ one }) => ({
    modVersion: one(modVersions, {
      fields: [modVersionDependencies.modVersionsId],
      references: [modVersions.id],
      relationName: "modVersion",
    }),
    dependency: one(mods, {
      fields: [modVersionDependencies.dependencyId],
      references: [mods.id],
      relationName: "mod",
    }),
  }),
)

const modVersionSupportedGameVersions = pgTable(
  "mod_version_supported_game_versions",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    modVersionId: uuid("mod_version_id")
      .notNull()
      .references(() => modVersions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    gameVersionId: uuid("game_version_id").references(() => gameVersions.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
)

const modVersionSupportedGameVersionsRelations = relations(
  modVersionSupportedGameVersions,
  ({ one }) => ({
    modVersion: one(modVersions, {
      fields: [modVersionSupportedGameVersions.modVersionId],
      references: [modVersions.id],
      relationName: "modVersion",
    }),
    gameVersion: one(gameVersions, {
      fields: [modVersionSupportedGameVersions.gameVersionId],
      references: [gameVersions.id],
      relationName: "gameVersion",
    }),
  }),
)

const modVersions = pgTable("mod_versions", {
  modId: text("mod_id")
    .notNull()
    .references(() => mods.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  version: text("version").notNull(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  downloadUrl: text("download_url").notNull(),
})

const modVersionsRelations = relations(modVersions, ({ one, many }) => ({
  mod: one(mods, {
    fields: [modVersions.modId],
    references: [mods.id],
    relationName: "mod",
  }),
  dependencies: many(modVersionDependencies, {
    relationName: "modVersion",
  }),
  supportedGameVersions: many(modVersionSupportedGameVersions, {
    relationName: "modVersion",
  }),
}))

const mods = pgTable(
  "mods",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    moreInfoUrl: text("more_info_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    category: text("category")
      .notNull()
      .references(() => categories.name, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      modSlugKey: unique("Mod_slug_key").on(table.slug),
    }
  },
)

const modsRelations = relations(mods, ({ many }) => ({
  contributors: many(modContributors, { relationName: "mod" }),
  versions: many(modVersions, { relationName: "mod" }),
  dependendents: many(modVersionDependencies, { relationName: "mod" }),
}))

const dbSchema = {
  keyStatus,
  keyType,
  requestStatus,
  factorType,
  factorStatus,
  aalLevel,
  codeChallengeMethod,
  categories,
  gameVersions,
  gameVersionsRelations,
  mods,
  modVersions,
  modContributors,
  modVersionDependencies,
  modVersionSupportedGameVersions,
  githubUsers,
  githubUsersRelations,
  modContributorsRelations,
  modVersionsRelations,
  modsRelations,
  modVersionDependenciesRelations,
  modVersionSupportedGameVersionsRelations,
}

export default dbSchema
