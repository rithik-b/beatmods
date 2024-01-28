import {
  pgTable,
  unique,
  pgEnum,
  uuid,
  text,
  boolean,
  foreignKey,
  timestamp,
} from "drizzle-orm/pg-core"

export const keyStatus = pgEnum("key_status", [
  "default",
  "valid",
  "invalid",
  "expired",
])
export const keyType = pgEnum("key_type", [
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
export const requestStatus = pgEnum("request_status", [
  "PENDING",
  "SUCCESS",
  "ERROR",
])
export const factorType = pgEnum("factor_type", ["totp", "webauthn"])
export const factorStatus = pgEnum("factor_status", ["unverified", "verified"])
export const aalLevel = pgEnum("aal_level", ["aal1", "aal2", "aal3"])
export const codeChallengeMethod = pgEnum("code_challenge_method", [
  "s256",
  "plain",
])

export const categories = pgTable(
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

export const gameVersions = pgTable(
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

export const githubUsers = pgTable("github_users", {
  id: uuid("id").primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  name: text("name"),
  userName: text("user_name").notNull(),
  avatarUrl: text("avatar_url"),
})

export const modContributors = pgTable("mod_contributors", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  modId: text("mod_id")
    .notNull()
    .references(() => mods.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => githubUsers.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
})

export const modVersionDependencies = pgTable("mod_version_dependencies", {
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
    .references(() => mods.id, { onDelete: "restrict", onUpdate: "cascade" }),
})

export const modVersionSupportedGameVersions = pgTable(
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

export const modVersions = pgTable("mod_versions", {
  modId: text("mod_id")
    .notNull()
    .references(() => mods.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  version: text("version").notNull(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  downloadUrl: text("download_url").notNull(),
})

export const mods = pgTable(
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
